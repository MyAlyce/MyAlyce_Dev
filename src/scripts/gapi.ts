//simply import to run this script on init

import { GDrive } from "./drive";

const googleClientID = "406817559914-boi30d05dk9jtj55frgi1dg8gkp6rrj9.apps.googleusercontent.com";

export let driveInstance:GDrive; //this will be set from

(function initGapiAuth() {
    if (location.hostname === 'localhost') return;
    
    function onGapiLoad() {
        // https://developers.google.com/identity/sign-in/web/reference

        //@ts-ignore
        gapi.load('auth2', () => {
            //@ts-ignore
        const GoogleAuth = gapi.auth2.init({
            // for more config options:
            // https://developers.google.com/identity/sign-in/web/reference#gapiauth2clientconfig
            client_id: googleClientID,
            scope: `https://www.googleapis.com/auth/drive`
        });
    
        GoogleAuth.then((gAuth) => {
            gapiResolve(() => gAuth);
        }, (err) => {
            console.log('UNHANDLED');
            console.error(err);
        });
        });

        driveInstance = new GDrive();
    }

    const script = document.createElement('script');
    script.type = "text/javascript";
    script.src = "https://apis.google.com/js/platform.js";
    script.onload = onGapiLoad; //gapi installed to window
    document.head.appendChild(script);

    //gapi init
    let gapiResolve;    

    const addGlobals = {
        log: console.log,
        // resolved only after it's initialized:
        gAuth: new Promise((res) => gapiResolve = res),
    }

    Object.keys(addGlobals).forEach((key) => {
        (window)[key] = (addGlobals)[key];
    });

})();

