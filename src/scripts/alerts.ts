import { HeartRateAlert } from "./alertTemplates/heartrate";
import { alerts, client, getStreamById, graph, state } from "./client";
import { BreathAlert } from "./alertTemplates/breath";
import { FallAlert } from "./alertTemplates/falldetection";
import { Howl } from "howler";
import { recordAlert } from "./datacsv";
import { webrtcData } from "./client";
import { toISOLocal } from "graphscript-services.storage";
import { RTCCallInfo } from "./webrtc";

export let getCurrentLocation = (options:PositionOptions={enableHighAccuracy:true}):Promise<{ 
    accuracy:number, 
    latitude:number, 
    longitude:number, 
    altitudeAccuracy:any, 
    altitude:any, 
    speed:any, 
    heading:any, 
    timestamp:number
}|undefined> => {
    return new Promise((res,rej) => {
        if(!navigator.geolocation) rej('Geolocation not found in window.navigator');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                res({ 
                    accuracy:position.coords.accuracy, 
                    latitude:position.coords.latitude, 
                    longitude:position.coords.longitude, 
                    altitudeAccuracy:position.coords.altitudeAccuracy, 
                    altitude:position.coords.altitude, 
                    speed:position.coords.speed, 
                    heading:position.coords.heading, 
                    timestamp:position.timestamp
                });
            },
            rej,
            options
        )
    });
}

//initialize on app load
getCurrentLocation().then((position) => {
    console.log('Test:: current position:', position);
}); //run on init to get permission

export const showNotification = (title,message) => {

    // Check if browser supports notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      // Create a notification
      
      new Notification(title, {
        body:message,
        icon: 'favicon.ico',
      });

    } else if ('Notification' in window && Notification.permission !== 'granted') {
      // Request permission to show notifications
      
      Notification.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            // Create a notification
            new Notification(title, {
                body:message,
                icon: 'favicon.ico',
            });
          } 
          
          //   Fallback to alert
          else alert(message)
        })
        .catch(error => {
          console.error('Failed to request notification permission:', error);
          alert(message)
        });
    
    } 
    
    // Fallback to alert
    else {
        alert(message);
    }
  };

let newClientAlerts = false;

export function checkForAlerts(streamId?) {
    if(streamId) {
        if(webrtcData.availableStreams[streamId]?.alerts) {
            let newAlerts = webrtcData.availableStreams[streamId].newAlerts;
            webrtcData.availableStreams[streamId].newAlerts = false;
            return {alerts:webrtcData.availableStreams[streamId].alerts, newAlerts};
        }
    } else {
        let newAlerts = newClientAlerts;
        newClientAlerts = false;
        return {alerts:alerts, newAlerts};
    }
}


export function toggleAlertNotifications() {
    state.setState({alertsEnabled:!state.data.alertsEnabled});
}
export function toggleHRAlert() {
    state.setState({useHRAlert:!state.data.useHRAlert});
}
export function toggleBreathAlert() {
    state.setState({useBreathAlert:!state.data.useBreathAlert});
}
export function toggleFallAlert() {
    state.setState({useFallAlert:!state.data.useFallAlert});
}

export function onAlert(event, streamId?, send?) {

    console.warn("Alert:", event);

    if(state.data.alertsEnabled) {
        let sound = new Howl({src:'./sounds/alarm.wav'});
        sound.volume(0.05);
        sound.play(undefined,false);
        showNotification("Alert:", `${event.message} ${event.value ? ': '+event.value : ''} at ${toISOLocal(event.timestamp)}` );
    }

    //broadcast your own alerts to connected streams
    if(!streamId || send) {
        for(const key in webrtcData.availableStreams) {
            webrtcData.availableStreams[key].send({alert:event});
        }
    } 
        
    let from;
    if(streamId) {
        const call = webrtcData.availableStreams[streamId];
        from = (call as RTCCallInfo).firstName + (call as RTCCallInfo).lastName;
    } else {
        from = client.currentUser.firstName + client.currentUser.lastName;
    }

    event.from = from;

    recordAlert(event, streamId);

    if(streamId) {
        let call = getStreamById(streamId) as any;
        if(!call.alerts) call.alerts = [] as any;
        event.streamId = call._id; //for marking that its a remote message (for styling mainly)
        call.alerts.push(event);
        call.newAlerts = true;
    }
    else {
        newClientAlerts = true;
        alerts.push(event);
    }
    
    state.setValue(streamId ? streamId+'alert' : 'alert', event);
}


export function throwAlert(
    event:{
        message:string,
        value?:string,
        timestamp:number
    }={
        message:"Alert: Something Happened",
        value:"Test",
        timestamp:Date.now()
    }, streamId?, send?
) {
    onAlert(event, streamId, send);
}   

//alert system
export function setupAlerts(
    streamId?:string,
    alerts?:('hr'|'breath'|'fall')[]
) {
    let nodes = {};

    if(!alerts || alerts.includes('hr')) {
        let node = graph.add(new HeartRateAlert(
            (ev)=>{ if(state.data.useHRAlert) onAlert(ev,streamId) },
            streamId ? streamId+'hr' : 'hr',    
            streamId ? streamId+'hrAlert' : 'hrAlert'
        ));
        nodes['hr'] = node;
    }

    if(!alerts || alerts.includes('breath')) {
        let node = graph.add(new BreathAlert(
            (ev)=>{ if(state.data.useBreathAlert) onAlert(ev,streamId) },
            streamId ? streamId+'breath' : 'breath',
            streamId ? streamId+'breathAlert' : 'breathAlert'
        ));
        nodes['breath'] = node;
    }

    if(!alerts || alerts.includes('fall')) {
        let node = graph.add(new FallAlert(
            (ev)=>{ if(state.data.useFallAlert) onAlert(ev,streamId) },
            streamId ? streamId+'imu' : 'imu',
            streamId ? streamId+'fallAlert' : 'fallAlert'
        ));
        nodes['imu'] = node;
    }

    return nodes;
}


