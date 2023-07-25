import './scripts/hacktimer/HackTimer.min' //Prevent setTimeout loops from hanging in browser

import { ProfileStruct } from "graphscript-services/dist/src/extras/struct/datastructures/types";
import { graph, onLogin, setupTestUser, DataServerSocket, state } from "./scripts/client";
import { authorizeCode, refreshToken, setupFitbitApi } from "./scripts/fitbit";
import { login } from "./scripts/login";

import { connectionHasId } from "graphscript";//"../../graphscript/index"//

export function getDictFromUrlParams(url = window.location) {
    const paramDict: any = {};
    const searchParams = new URLSearchParams(url.search);
    searchParams.forEach((val, key) => paramDict[key] = val);

    return paramDict;
}

if ('Notification' in window && Notification.permission !== 'denied') {
  // Request permission to show notifications
  Notification.requestPermission()
    .then(permission => {
      if (permission === 'granted') {
        // Create a notification
        // new Notification('Hello, World!', {
        //   body: 'This is a notification example.',
        //   icon: 'favicon.ico',
        //});
      }
    })
    .catch(error => {
      console.error('Failed to request notification permission:', error);
    });
}

let params = getDictFromUrlParams();

//get fitbit api ready for querying
async function initThirdPartyAPIs(u:Partial<ProfileStruct>) {

    //fitbit redirect return trip
    //in this case we attach the current user to the fitbit code
    if (params.code && params.state && (params.state?.search('is_fitbit=true') > -1)) {
        let res = await authorizeCode(u?._id as string, params.code);
        if(res.errors || res.html) alert('Fitbit failed to authorize');
        else alert('Fitbit authorized!');
    }
  
    //if we have an access token let's setup the fitbit api
    if((u?.data as any)?.fitbit?.access_token) {

        if(((u as ProfileStruct).data as any).fitbit.expires_on < Date.now()) {
            u = await refreshToken((u as ProfileStruct)._id as string);
        }

        let api = setupFitbitApi(((u as ProfileStruct).data as any).fitbit.access_token, ((u as ProfileStruct).data as any).fitbit.user_id)
        console.log('fitbit api:', api);
    }
}


//TEST
const TESTUSER = false;



const init = async () => {

  state.setState({fetchingLogin:true});

  if(DataServerSocket.info) await connectionHasId(DataServerSocket.info,3000);
  let promise;
  //spaghetti tests
  if(TESTUSER) {
    promise = setupTestUser().then(async (u) => {
      console.log('test user:', u);
      return { data:u };
    });
  }
  else {
    promise = login();
  }
  
  if(promise) promise.then(
    async (result) => {
      
      let u = await onLogin(result);
  
      if(u) {
        //in this case we attach the logged in user to the fitbit code
        initThirdPartyAPIs(u);
        //await restoreSession(u);
      } else state.setState({fetchingLogin:false});
    });
  else state.setState({fetchingLogin:false});
  
}



init();

