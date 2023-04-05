import { state } from "graphscript";
import { graph } from './client'


export let getCurrentLocation = (options:PositionOptions={enableHighAccuracy:true}) => {
    return new Promise((res,rej) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                res(position);
            },
            rej,
            options
        )
    });
}

getCurrentLocation(); //run on init to get permission