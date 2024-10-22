//google login and backend setup
import { App as RealmApp, Credentials, handleAuthRedirect } from "realm-web";

const realmId = 'application-0-wlbuxqy';

export const realm = new RealmApp(realmId);


//e.g...
type DefaultUserProfileData = {
    name?: string;
    email?: string;
    pictureUrl?: string;
    firstName?: string;
    lastName?: string;
    sex?: string;
    birthday?: string;
    minAge?: string;
    maxAge?: string;
}


type PeerType =
    | "anon-user"
    | "api-key"
    | "local-userpass"
    | "custom-function"
    | "custom-token"
    | "oauth2-google"
    | "oauth2-facebook"
    | "oauth2-apple";

    
export type RealmUser = { //The token we receive from Realm
    id: string;
    accessToken: string | null; //fitbit access token
    refreshToken: string | null; //fitbit refresh token
    /** Check if this is correct: */
    profile: {
        // type: 'normal' | 'server';
        identities: { id: string; peerType: PeerType }[]; 
        data: DefaultUserProfileData; //default props expected = user profile data
    };// | undefined;
    state: "active" | "logged-out" | "removed"; //login state
    customData: any; //arbitrary data
}; //I don't think this is the right format anymore

//set the current realm user, specify google for the login to use that, requires a valid google client id and permissions
export const login = async (
    login?:string | 'google' | 'apple' | 'facebook',
    password?:string
) => {

    let { currentUser } = realm;
    let type: 'LOG_IN' | 'REFRESH' = 'LOG_IN'


    if (currentUser) {
        try {
            await currentUser.refreshAccessToken(); //realm function
            //send this with every message transaction
            type = 'REFRESH'
        } catch(err) {

            return {
                type: 'FAIL' as const,
                data: { err, type: 'REFRESH' }
            }
        }
    } else {
        let creds = await new Promise((res,rej) => {
            try{
                if(login === 'google') {
                    setTimeout(() => {
                        res(Credentials.google({ redirectUrl: window.location.origin })); 
                        //realm function
                    },1)
                }
                else if (login === 'apple') {
                    res(Credentials.apple(window.location.origin));
                }
                else if (login === 'facebook') {
                    res(Credentials.facebook(window.location.origin));
                }
                else {
                    if(login)
                        res(Credentials.emailPassword((login as string),(password as string))); //realm function
                    else res(undefined)
                }
            } catch(err) {rej(err);}
        }) as Credentials|undefined;
        if (creds) {
            try {
                const user = await realm.logIn(creds); //realm function

                if (user) {
                    await user.refreshAccessToken(); //realm function
                    currentUser = user;
                }
            } catch (err) {

                return {
                    type: 'FAIL' as const,
                    data: { err, type: 'LOGIN' }
                }
            }
            // if currentUser exists & no login credentials are passed
        }
    }

    return currentUser ? 
        {  //if currentUser exists, success
            type, 
            data: currentUser.toJSON() as RealmUser|any
        } : { //else failure
            type: 'FAIL' as const,
            data: { err: undefined, type: 'UNCAUGHT' }
        };
}


//logout the current realm user
export const logout = async (onLogout?:(result:any)=>void) => {
    let res;
    if (!realm.currentUser) //if current user does not exist
        res = { type: 'FAIL' as const, data: { err: new Error('No User Logged In') } };
    else try {
        await realm.currentUser.logOut(); //realm function
        res = { type: 'LOGOUT' as const };
    } catch(err) {
        console.log(err);
        res = { type: 'FAIL' as const, data: { err: new Error('Failed to logout') } };
    }
    
    if(onLogout) onLogout(res);
    return res;
}


if (window.location.href.includes('_baas_client_app_id')) {
    handleAuthRedirect(window.location); // Authenticates on the other tab and closes this one
}
