import { ProfileStruct } from "graphscript-services/dist/src/extras/struct/datastructures/types";
import { graph, onLogin, setupTestUser, usersocket } from "./scripts/client";
import { authorizeCode, refreshToken, setupFitbitApi } from "./scripts/fitbit";
import { login } from "./scripts/login";

import './scripts/gapi' //setup gapi
import { connectionHasId } from "graphscript";

export function getDictFromUrlParams(url = window.location) {
    const paramDict: any = {};
    const searchParams = new URLSearchParams(url.search);
    searchParams.forEach((val, key) => paramDict[key] = val);

    return paramDict;
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
const TESTUSER = true;



const init = async () => {
  await connectionHasId(usersocket);
  
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
        graph.setState({viewingId: u?._id});
        //in this case we attach the logged in user to the fitbit code
        initThirdPartyAPIs(u);
        //await restoreSession(u);
      }
    }
  );
}



init();

