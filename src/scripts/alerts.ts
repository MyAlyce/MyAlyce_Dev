import { HeartRateAlert } from "./alertTemplates/heartrate";
import { alerts, graph } from "./client";
import { BreathAlert } from "./alertTemplates/breath";
import { FallAlert } from "./alertTemplates/falldetection";
import { Howl } from "howler";
import { recordAlert } from "./datacsv";
import { webrtcData } from "./client";

export let getCurrentLocation = (options:PositionOptions={enableHighAccuracy:true}) => {
    return new Promise((res,rej) => {
        if(!navigator.geolocation) rej('Geolocation not found in window.navigator');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                res(position);
            },
            rej,
            options
        )
    });
}

//test
getCurrentLocation().then((position) => {
    console.log('current position:', position);
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

export function onHRAlert(event,streamId?) {

    console.log("Heart Rate Alert:", event);

    alerts.push(event);
    
    let sound = new Howl({src:'./sounds/alarm.wav'});
    sound.play(undefined,false);
    showNotification("Heart Rate Alert:", `bpm: ${event.value}` );

    recordAlert(event, streamId);

    //broadcast your own alerts
    if(!streamId) {
        for(const key in webrtcData.availableStreams) {
            webrtcData.availableStreams[key].send({alert:event});
        }
    }
}

export function onBreathAlert(event,streamId?) {

    console.log("Breathing Alert:", event);

    alerts.push(event);

    recordAlert(event,streamId);
    let sound = new Howl({src:'./sounds/alarm.wav'});
    sound.play(undefined,false);
    showNotification("Breathing Alert:", `bpm: ${event.value}` );

    recordAlert(event, streamId);

    //broadcast your own alerts
    if(!streamId) {
        for(const key in webrtcData.availableStreams) {
            webrtcData.availableStreams[key].send({alert:event});
        }
    }
}

export function onFallAlert(event,streamId?) {

    console.log("Motion Alert:", event);

    alerts.push(event);

    recordAlert(event,streamId);
    let sound = new Howl({src:'./sounds/alarm.wav'});
    sound.play(undefined,false);
    showNotification("Fall Alert:", `magnitude: ${event.value}` );

    recordAlert(event, streamId);

    //broadcast your own alerts
    if(!streamId) {
        for(const key in webrtcData.availableStreams) {
            webrtcData.availableStreams[key].send({alert:event});
        }
    }
}

//used in the webrtc stream
export function onAlert(event,streamId?) {
    if(event.message.includes('Heart')) {
        onHRAlert(event,streamId);
    } else if (event.message.includes('Breathing')) {
        onBreathAlert(event,streamId);
    } else if (event.message.includes('Fall')) {
        onFallAlert(event,streamId);
    }
}

//alert system
export function setupAlerts(
    streamId?,
    alerts?:('hr'|'breath'|'fall')[]
) {
    let nodes = {};

    if(!alerts || alerts.includes('hr')) {
        let node = graph.add(new HeartRateAlert(
            onHRAlert,
            streamId ? streamId+'hr' : 'hr',    
            streamId ? streamId+'hrAlert' : 'hrAlert'
        ));
        nodes['hr'] = node;
    }

    if(!alerts || alerts.includes('breath')) {
        let node = graph.add(new BreathAlert(
            onBreathAlert,
            streamId ? streamId+'breath' : 'breath',
            streamId ? streamId+'breathAlert' : 'breathAlert'
        ));
        nodes['breath'] = node;
    }

    if(!alerts || alerts.includes('fall')) {
        let node = graph.add(new FallAlert(
            onFallAlert,
            streamId ? streamId+'imu' : 'imu',
            streamId ? streamId+'fallAlert' : 'fallAlert'
        ));
        nodes['imu'] = node;
    }

    return nodes;
}


