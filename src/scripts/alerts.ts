import { HeartRateAlert } from "./alertTemplates/heartrate";
import { graph, state } from "./client";
import { BreathAlert } from "./alertTemplates/breath";
import { FallAlert } from "./alertTemplates/falldetection";
import { Howl } from "howler";

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

getCurrentLocation().then((position) => {
    console.log('current position:', position);
}); //run on init to get permission


//alert system
export function setupAlerts(
    streamId?,
    alerts?:('hr'|'breath'|'fall')[]
) {
    let nodes = {};
    if(!alerts || alerts.includes('hr')) {
        let node = graph.add(new HeartRateAlert(
            (event) => {
                console.log("Heart Rate Alert:", event);
                let sound = new Howl({src:'./sounds/alarm.wav'}); // Only play the sound if a value has been provided
                sound.play(undefined,false);
                showNotification("Heart Rate Alert:", `bpm:${event.bpm}` );
            },
            streamId ? streamId+'hr' : 'hr',    
            streamId ? streamId+'hrAlert' : 'hrAlert'
        ));
        nodes['hr'] = node;
    }
    if(!alerts || alerts.includes('breath')) {
        let node = graph.add(new BreathAlert(
            (event) => {
                console.log("Breathing Alert:", event);
                let sound = new Howl({src:'./sounds/alarm.wav'}); // Only play the sound if a value has been provided
                sound.play(undefined,false);
            },
            streamId ? streamId+'breath' : 'breath',
            streamId ? streamId+'breathAlert' : 'breathAlert'
        ));
        nodes['breath'] = node;
    }
    if(!alerts || alerts.includes('fall')) {
        let node = graph.add(new FallAlert(
            (event) => {
                console.log("Motion Alert:", event);
                let sound = new Howl({src:'./sounds/alarm.wav'}); // Only play the sound if a value has been provided
                sound.play(undefined,false);
            },
            streamId ? streamId+'imu' : 'imu',
            streamId ? streamId+'imuAlert' : 'imuAlert'
        ));
        nodes['imu'] = node;
    }

    return nodes;
}

