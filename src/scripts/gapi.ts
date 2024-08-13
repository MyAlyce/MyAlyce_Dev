//simply import to run this script on init


export const googleClientID = "";
export const apiKey = "";


// (function initGapiAuth() {
//     if (location.hostname === 'localhost') return;
    
//     function handleClientLoad() {
//         window.gapi.load('client:auth2', initClient);
//     }
    
    
//     function updateSigninStatus(isSignedIn) {
//         if (isSignedIn) {
//             console.log("Signed in with Google, Drive, Docs, and Sheets available.")
//         } else {
//             console.log("Signed out of Google")
//         }
//     }
    
    
//     function initClient() {
//         window.gapi.auth2.initialized = false;
//         // Array of API discovery doc URLs for APIs used by the quickstart
//         var DISCOVERY_DOCS = [
//             //"https://sheets.googleapis.com/$discovery/rest?version=v4",
//             "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
//         ];
    
//         window.gapi.client.init({
//             apiKey: '',
//             clientId: "",
//             discoveryDocs: DISCOVERY_DOCS,
//             scope: "https://www.googleapis.com/auth/drive"
//         }).then(function () {
//             // Listen for sign-in state changes.
//             window.gAuth = window.gapi.auth2.getAuthInstance()
//             window.gAuth.auth.isSignedIn.listen(updateSigninStatus);
//             window.gapi.auth2.initialized = true;
//             // Handle the initial sign-in state.
//             window.updateSigninStatus(this.auth.isSignedIn.get());
            
//         }, function(error) {
//             console.log(error);//appendPre(JSON.stringify(error, null, 2));
//         });
//     }
    
//     const script = document.createElement('script');
//     script.type = "text/javascript";
//     script.src = "https://apis.google.com/js/api.js";
//     script.onload = handleClientLoad; //gapi installed to window
//     document.head.appendChild(script);


// })();
