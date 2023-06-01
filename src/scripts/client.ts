import { 
    Graph, 
    Router, 
    WorkerService, 
    EventHandler, 
    WSSfrontend,
    ConnectionProps, 
    WebSocketProps, 
    WebSocketInfo, 
    SessionsService,
    GraphNode,
    state,
    WebRTCfrontend,
    WebRTCProps
} from 'graphscript'//'../../../graphscript/index'//

//isolated import for dev with src
import { StructFrontend } from 'graphscript-services'//'../../../graphscript/src/extras/index.services'//
import {BFSRoutes} from 'graphscript-services.storage'//'../../../graphscript/src/extras/index.storage.services'//

import { ProfileStruct } from 'graphscript-services/dist/src/extras/struct/datastructures/types'
import { workers } from 'device-decoder'

import { RealmUser, logout } from './login'

import config from '../../backend/serverconfig.js'
import { DS } from 'graphscript-services/struct/datastructures/index'
import { GDrive } from './drive'
import { apiKey, googleClientID } from './gapi'
import { disconnectDevice } from './device'

import { demo, stopdemos } from './demo'
import { RTCCallInfo } from './webrtc'


const startDemo = true;

export const client = new StructFrontend({state:state});
export const sockets = new WSSfrontend({state:state});

export const webrtc = new WebRTCfrontend({state:state});

export const webrtcData = {
    webrtcStream:undefined, //current active stream
    availableStreams:webrtc.rtc as {[key:string]:RTCCallInfo}, //list of accepted calls
    unansweredCalls:webrtc.unanswered as {[key:string]:WebRTCProps & {caller:string, firstName?:string, lastName?: string}}
}

export let defaultProfilePic = './assets/person.jpg';


//list available streams
export function getAvailableConnections() {
    return {
        ...webrtc.rtc
    };
}

state.setState(webrtcData);


export let usersocket:WebSocketInfo;

export {state}; //

export let driveInstance:GDrive;

export type Sensors = 'emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg';

export type Streams = ('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg'|'chat'|'events'|'alerts')[];

export const SensorDefaults = ['emg','ppg','breath','hr','imu','env','ecg'] as Sensors[];
export const StreamDefaults = ['emg','ppg','breath','hr','imu','env','ecg','chat','events','alerts'] as any as Streams[];

export const alerts = [] as {message:string,value:any, from:string, timestamp:number|string}[]; //session alerts
export const events = [] as {message:string, from:string, timestamp:number|string}[]; //session events

export const graph = new Router({
    services:{
        client,
        sockets,
        webrtc,
        workers, //has independent state just fyi
        SessionsService
    },
    state:state,
    roots:{
        cleanupCallInfo:(callId)=>{ //for webrtc
            delete webrtc.unanswered[callId];
            state.setState({
                unansweredCalls:webrtc.unanswered
            }); //update this event for the app
        }
    }
});

graph.subscribe('checkForNotifications',(result:any[])=>{
    console.log('checked notifications:', result);
    if(result?.length > 0) client.resolveNotifications(result,true).then((latest) => {
        if(latest?.length > 0) {
            latest.forEach((struct) => {
                if(struct?.structType === 'authRequest') {
                    console.log('Received peer request from', struct.firstName, struct.lastName); //todo:turn this into a popup thing
                }
            })
        }
    }); //pull latest data. That's it!
})

graph.setState({
    route: '/',            //current pathname
    isLoggedIn: false,     //logged in?
    loggingIn: false,       //loading login?
    appInitialized: false, //initialized app?
    loggedInId: undefined, //id of the current user
    viewingId: undefined,  //id of the user currently being viewed
    
    detectedEMG:false,
    detectedENV:false,
    detectedPPG:false,
    detectedIMU:false,
    detectedEMG2:false
});

let makeSocket = () => {
    usersocket = sockets.open({
        host:config.host,
        port:config.dataserverport,
        path:'wss'
    });
    
    usersocket.socket.addEventListener('message', (ev) => {
        let data = ev.data;
        
        //debug
        //console.log(ev.data);
        
        if(data.includes('{')) data = JSON.parse(data);
        client.baseServerCallback(ev.data)
    });
}

makeSocket();



export const onLogin = async (
    result:
      {
        type: "FAIL";
        data: {
            err: unknown;
            type: string;
            id?:string
        };
    } | {
        type: "REFRESH" | "LOG_IN";
        data: RealmUser|any;
    }
  ): Promise<Partial<ProfileStruct|undefined>> => {
    let resultHasUser = false;

    let profile;
    if(result?.data?.profile) 
        profile = {
            ...result.data.profile.data,
            accessToken:result.data.accessToken,
            refreshToken:result.data.refreshToken,
            _id:result.data.id
        }

    let p;
    if(result && result?.type !== 'FAIL') {
        if(profile._id) {

            state.setState({ loggingIn:true });

            client.currentUser = {
                ...usersocket,
                _id:profile._id
            } as any;

            await usersocket.run('addUser', [profile, {[usersocket._id as string]:usersocket._id }]);  //associate user id with connection (needs to be unique)
            p = client.setupUser(profile); //see struct router (formerly UserPlatform)
        }
    }
  
    if(p) {
        let user = await p;
        if(user) {
            resultHasUser = true;
            state.setState({
                isLoggedIn: true,
                loggingIn: false,
                loggedInId: user._id,
                viewingId: user._id
            });
            
            console.log("Logged in: ", user, client);

            driveInstance = new GDrive(apiKey, googleClientID);

            restoreSession(user);

            if(startDemo) {
                demo();
            }
            
            return user;
        }
    }

    if(!resultHasUser) {
        console.log('User not created with info:', result?.data);
        if(state.data['isLoggedIn']) state.setState({
            isLoggedIn: false,
            loggingIn: false
        });
    }          

    return undefined as any;
}

export const onLogout = (
    result:{ type: 'FAIL'|'LOGOUT', data?:{err:Error}}
) => {

    usersocket.terminate();
    makeSocket(); //this just lets the backend know this connection is no longer associated with the previous user

    state.setState({
        isLoggedIn: false,
        loggingIn: false,
        loggedInId: undefined,
        viewingId: undefined
    });
}

export const logoutSequence = () => {
    if(state.data.demoing) {
        stopdemos();
    } else if (state.data.deviceConnected) {
        disconnectDevice();
    }
    logout(onLogout);
}


//subscribe to the state so any and all changes are saved, can store multiple states (e.g. particular for pages or components)
export function backupState(
    filename='state.json', 
    backup=['isLoggedIn','viewingId','loggedInId','route'],
    dir='data'
){
    //read initial data, now setup subscription to save the state every time it updates

    let lastState = {};
    let hasUpdate = false;

    backup.forEach((v) => {
        lastState[v] = state.data[v];
        state.subscribeEvent(v, (newValue) => {
            lastState[v] = newValue;
            hasUpdate = true;    
        });
    });

    function backupLoop() {

        if(hasUpdate) {
            BFSRoutes.writeFile(
                dir+'/'+filename,
                JSON.stringify(lastState),
            );
            hasUpdate = false;
        }
           
        setTimeout(()=> {backupLoop()}, 500 );
    }

    backupLoop();
}

setTimeout(() => {
    backupState();
}, 100);

//should subscribe to the state then restore session to setup the app
export async function restoreSession(
    u:Partial<ProfileStruct>|undefined,
    filename='state.json', //state file
    dir='data'
) {
    //make sure the indexeddb directory is initialized

    let exists = await BFSRoutes.exists(dir+'/'+filename);

    let read;
    if(exists) {
        read = await BFSRoutes.readFileAsText(
            dir+'/'+filename,
        )
        try {
            if(read) {
                let restored = JSON.parse(read);
                if(typeof restored === 'object') {
                    if(restored.loggedInId && restored.loggedInId === u?._id || !restored.loggedInId) 
                        state.setState(restored);
                }
            }
        } catch (err) {
            console.error(err);
        }
    }
      
    backupState(filename);

    return read;

}



export function subscribeToStream(
    stream:Sensors|'chat'|'alerts', 
    onchange:(result:any)=>void, 
    streamId?:string
) {
    return state.subscribeEvent(streamId ? streamId+stream : stream, onchange);
}

export function unsubscribeFromStream(
    stream:Sensors|'chat'|'alerts',
    sub:number|undefined, 
    streamId?:string
) {
    return state.unsubscribeEvent(streamId ? streamId+stream : stream, sub);
}





//dummy profile
export const testuser:ProfileStruct = DS.ProfileStruct(
    'test',
    {
        _id:'testclient',//randomId('test'),
        email:'testclient@myalyce.com',
        username:'testclient',
        firstName:'Harvey',
        lastName:'Dent',
        sex:'m',
        birthday:'09/10/1993',
        // data:{
        //     fitbit: {
        //         access_token: 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMkM3UUsiLCJzdWIiOiI5TVA1WlgiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJ3aHIgd251dCB3cHJvIHdzbGUgd3dlaSB3c29jIHdhY3Qgd3NldCB3bG9jIiwiZXhwIjoxNjQ4MjEwODM3LCJpYXQiOjE2NDgxODIwMzd9.BMpbb3v69OW2r5QXvFsbMsEAALvvUxI9Vuyy28f98bo',
        //         expires_in: 28800,
        //         refresh_token: '56a85241ae06b8b48b667634daee08927c39b7e6bdffbf0459d0148c7c683e84',
        //         user_id: '9MP5ZX',
        //         scope: 'social location nutrition sleep profile heartrate activity settings weight',
        //         token_type: 'Bearer'
        //     }
        // }
})// as ProfileStruct;

//setup the live user

export async function setupTestUser():Promise<Partial<ProfileStruct> | undefined> { 

    return await new Promise( async (res) => {
        //setTimeout(async() => {
        //
            console.log(usersocket._id);
            let ping = await usersocket.run('ping');
            console.log("Ping Result: ", ping);

            res(testuser);

        //}, 1000);
    });
}

// let client2 = new StructBackend();
// //second user test for two way communications testing
// export const testpeer:ProfileStruct = DS.ProfileStruct(
//     'test',
//     {
//         _id:'testpeer',//randomId('test'),
//         email:'testpeer@myalyce.com',
//         username:'testpeer',
//         firstName:'The',
//         lastName:'Batman',
//         sex:'m',
//         birthday:'01/19/1483'
// });// as ProfileStruct;


// export async function setupTestPeer():Promise<Partial<ProfileStruct> | undefined> {

//      let socket = sockets.open({
//          host:window.location.origin,
//          port:config.dataserverport,
//          path:'wss',
//          onopen:async (ev,ws,wsinfo) => {
        
//              //test
//              let ping = await socket.run('ping');
//              console.log("Ping Result: ", ping);

//              client.currentUser = {
//             ...socket,
//             _id:testuser._id
//              } as any;

//               let user = await client.setupUser(testuser as Partial<ProfileStruct>);

//              return user;
//          },
//          onmessage:(data) => {
//              if(typeof data === 'string') data = JSON.parse(data);
//              client.baseServerCallback(data);
//          }
//      });
// }
