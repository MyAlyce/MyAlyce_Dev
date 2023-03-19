import { StructBackend } from "graphscript-services";

export class FitbitAuth {
    access_token: string = '';
    expires_in: number = 0;
    refresh_token: string = '';
    /** Fitbit user id */
    user_id: string = '';
    
    scope?: string;
    token_type?: 'Bearer';
}

export type FitbitErr = {
    errors: {
        errorType: string;
        message: string;
    }[];
    success: false;
}

export type FitbitAuthResponse = FitbitAuth | FitbitErr;



//mongoose schema


//fetch api

export async function refreshFitbitToken(refreshToken: string) {

    if(!refreshToken) console.error('no refreshToken provided');

    if(!process.env.FITBIT_CLIENT_ID || !process.env.FITBIT_KEY)  console.error('NEED ENV KEYS: FITBIT_CLIENT_ID && FITBIT_KEY && FRONTEND_URL');

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
        headers: {
            'Content-Type': "application/x-www-form-urlencoded",
            "Authorization": `Basic ${process.env.FITBIT_KEY}`
        },
    });

    return (await response.json()) as FitbitAuthResponse;
}

export async function authorizeFitbit(code: string) {

    if(!code) console.error('no code provided');

    if(!process.env.FITBIT_CLIENT_ID || !process.env.FITBIT_KEY)  console.error('NEED ENV KEYS: FITBIT_CLIENT_ID && FITBIT_KEY && FRONTEND_URL');

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
        method: 'POST',
        body: `client_id=${process.env.FITBIT_CLIENT_ID}&grant_type=authorization_code&redirect_uri=${process.env.FRONTEND_URL}&code=${code}`,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${process.env.FITBIT_KEY}`
        }
    });

    return (await response.json()) as FitbitAuthResponse;
}

export async function revokeFitbitAuth(accessToken: string) {

    if(!accessToken) console.error('no accessToken provided');

    if(!process.env.FITBIT_CLIENT_ID || !process.env.FITBIT_KEY)  console.error('NEED ENV KEYS: FITBIT_CLIENT_ID && FITBIT_KEY && FRONTEND_URL');

    const response = await fetch('https://api.fitbit.com/oauth2/revoke', {
        method: 'POST',
        body: "token=" + accessToken,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${process.env.FITBIT_KEY}`
        }
    });

    const data = await response.json();

    if (data.errors)
        return data as FitbitErr;
    else 
        return true;
}

export async function checkFitbitToken(accessToken: string) {

    if(!process.env.FITBIT_CLIENT_ID || !process.env.FITBIT_KEY)  console.error('NEED ENV KEYS: FITBIT_CLIENT_ID && FITBIT_KEY && FRONTEND_URL');

    const response = await fetch('https://api.fitbit.com/1.1/oauth2/introspect', {
        method: 'POST',
        body: "token=" + accessToken,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${process.env.FITBIT_KEY}`
        }
    });

    // console.log('CHECK', response)

    
    return (await response.json()) as (FitbitErr | {
        active: true;
        scope: string;
        client_id: string;
        user_id: string;
        token_type: string;
        exp: number;
        iat: number;
    } | {
        active: false;
    });
}



//load into the struct backend
export const fitbitRoutes = {
    'authorizefitbit':async function (...args:any[]) {
        let u = await (this.__node.graph as StructBackend).getUser(args[0], args[1]);

        if(!u) return undefined;

        let res = await authorizeFitbit(args[1]);

        if((res as FitbitErr).errors) { return res; }

        let fbauth = u.data?.fitbit;

        if(fbauth) delete u.data.fitbit;

        u.data.fitbit = new FitbitAuth();
        Object.assign(u.data.fitbit,{...res});
        u.data.fitbit.expires_on = Date.now() + (((res as FitbitAuth).expires_in - 60) * 1000);

        let updated = await (this.__node.graph as StructBackend).setUser(args[0], u);

        return updated;
        
    },
    'refreshFitbit':async function (...args:any[]) {
        let u = await (this.__node.graph as StructBackend).getUser(args[0], args[1]);

        if(!u) return undefined;

        let fbauth = u.data?.fitbit;

        if(!fbauth) {
            return undefined;
        } 
        let res = await refreshFitbitToken(fbauth.refresh_token) as FitbitAuth|FitbitErr;
        if((res as FitbitErr).errors) { return res; }

        u.data.fitbit.access_token = (res as FitbitAuth).access_token;
        u.data.fitbit.expires_in = (res as FitbitAuth).expires_in;
        u.data.fitbit.refresh_token = (res as FitbitAuth).refresh_token;
        u.data.fitbit.expires_on = Date.now() + (((res as FitbitAuth).expires_in - 60) * 1000);

        let updated = await (this.__node.graph as StructBackend).setUser(args[0] , u);

        return updated;
        
    },
    'rejectFitbit':async function (...args:any[]) {
        let u = await (this.__node.graph as StructBackend).getUser(args[0], args[1]);

        if(!u) return undefined;

        let fbauth = u.data?.fitbit;

        if(fbauth) delete u.data.fitbit;

        let updated = await (this.__node.graph as StructBackend).setUser(args[0], u);

        if(updated) {
            let res = await revokeFitbitAuth(fbauth.access_token);

            if((res as FitbitErr).errors) { return res; }

        }

        return updated;

    },
    'checkFitbitToken':async function (...args:any[]) {
        let u = await (this.__node.graph as StructBackend).getUser(args[0], args[1]);

        if(!u) return undefined;

        let fbauth = u.data?.fitbit;

        let res = await checkFitbitToken(fbauth.access_token);

        return res;

    }
}


