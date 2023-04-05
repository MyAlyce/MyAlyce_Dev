import { state } from "graphscript";
import { HeartRateAlert } from "./alertTemplates/heartrate";
import { graph } from "./client";
import { BreathAlert } from "./alertTemplates/breath";
import { FallAlert } from "./alertTemplates/falldetection";
import { Howl } from "./alertTemplates/howler";

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
                let sound = new Howl({src:'./alerts/sounds/alarm.wav'}); // Only play the sound if a value has been provided
                sound.play();
            },
            streamId ? streamId+'hr' : 'hr',
            streamId ? streamId+'hrAlert' : 'hrAlert'
        ));
        nodes['hr'] = node;
    }
    if(!alerts || alerts.includes('breath')) {
        let node = graph.add(new BreathAlert(
            (event) => {
                console.log("Heart Rate Alert:", event);
                let sound = new Howl({src:'./alerts/sounds/alarm.wav'}); // Only play the sound if a value has been provided
                sound.play();
            },
            streamId ? streamId+'breath' : 'breath',
            streamId ? streamId+'breathAlert' : 'breathAlert'
        ));
        nodes['breath'] = node;
    }
    if(!alerts || alerts.includes('fall')) {
        let node = graph.add(new FallAlert(
            (event) => {
                console.log("Heart Rate Alert:", event);
                let sound = new Howl({src:'./alerts/sounds/alarm.wav'}); // Only play the sound if a value has been provided
                sound.play();
            },
            streamId ? streamId+'imu' : 'imu',
            streamId ? streamId+'imuAlert' : 'imuAlert'
        ));
        nodes['imu'] = node;
    }

    return nodes;
}

