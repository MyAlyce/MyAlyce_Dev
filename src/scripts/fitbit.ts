import { FitbitApi } from '@giveback007/fitbit-api';
import { ProfileStruct } from 'graphscript-services/dist/src/extras/struct/datastructures/types';
import { DataServerSocket, client } from './client'
//REST authorizations to get the refresh token
//opens the fitbit authorization portal to authorize our app for this client. We then can get the refresh token 
export function setupFitbitApi(accesstoken:string, fitbitId:string, syncRate:number=5*60*1000, parentUser?:Partial<ProfileStruct>) {
    //provide fitbit key

    let api = new FitbitApi(
        accesstoken as string,
        fitbitId as string
    );

    //console.log('Fitbit:', api);

    //backup heartrate
    //api.heartRate
    
    //backup nutrition
    //api.nutrition

    //backup sleep
    //api.sleep

    //backup body
    //api.body

    //backup activity
    //api.activity

    //backup body
    //api.body

    // DS.DataStruct(
    //     'fitbit',
    //     {permissions:{synced:Date.now(), syncRate, ...permissions}},
    //     parentUser
    // );

    //console.log('get lifetime stats',api.activity.getLifetimeStats());

    //backupFitbit(api);

    return api;

}


export async function authorizeRedirect() {
    const appRedirect = "https://app.myalyce.com"; // DON'T TOUCH. fitbit wont authorize on 'localhost'.
    const clientId = '22C7QK';
    const scope = [ "activity", "heartrate", "location", "nutrition", "profile", "settings", "sleep", "social", "weight"] as const;
    let reState = `is_fitbit=true,path=${window.location.pathname}`; //let the site know where to redirect back to

    if (window.location.hostname === 'localhost') {
        const { hostname, port } = window.location;
        reState = reState + `,localhost_redirect=${hostname}:${port}`;
    }

    // TODO: https://dev.fitbit.com/build/reference/web-api/oauth2/#redirect-uris
    // state: Fitbit strongly recommend including an anti-forgery token in this parameter and confirming its value in the redirect
    // 1. Make server request -> server returns obj id it generates for "preFitBitAuthObj: { realmId, _id, time: Date.now() }"
    // 2. redirect with state=re_fitbit_auth
    // 3. fitbitTokenApi.authorizeCode({ code, realmId, preAuthId });
    // 4. server validates that (preAuthId === preFitBitAuthObj._id) => send fitbit_auth_token

    const redirectUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${appRedirect}&scope=${scope.join('%20')}&expires_in=604800&${reState ? 'state=' + reState : ''}`;
    
    //listen for the url to change back

    window.location.replace(redirectUrl);
    //will return with the new refresh code
}

export async function authorizeCode(userId:string, fitbitCode: string) {

    if(!userId || !fitbitCode) return undefined;

    let res = (await DataServerSocket.info.run('authorizeFitbit', [userId, fitbitCode]));  
    
    console.log(res);

    if(res && !res.errors && !res.html) client.baseServerCallback(res);

    return res;
}

export async function refreshToken(userId:string) {

    if(!userId) return undefined;

    let res = (await DataServerSocket.info.run('refreshFitbit', userId));

    if(res && !res.errors && !res.html) client.baseServerCallback(res);

    return res;
}

export async function revokeAuth(userId:string) {

    if(!userId) return undefined;

    let res = (await DataServerSocket.info.run('revokeFitbit', userId));

    if(res && !res.errors && !res.html) client.baseServerCallback(res);

    return res;
}

export async function checkToken(userId:string) {

    if(!userId) return undefined;

    return (await DataServerSocket.info.run('checkFitbitToken', userId)); 
}

