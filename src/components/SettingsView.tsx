import { ProfileStruct } from 'graphscript-services/struct/datastructures/types';
import React from 'react';
import { client } from '../scripts/client';
import { authorizeRedirect } from '../scripts/fitbit';
import { sComponent } from './state.component';

export class SettingsView extends sComponent  {

    state = {
        viewingId: undefined
    }

    setupFitbit() {
        authorizeRedirect();
    }

    render() {

        let viewing = client.getLocalData('profile',{_id:this.state.viewingId}) as ProfileStruct;

        let fbreg = false;
        if((viewing?.data as any)?.fitbit?.access_token) {
            fbreg = true;
        }

        return (
        <div>
            <div>
                Profile Deets + Editing
            </div>
            <div>
                More fine grained permissions and opt-in stuff<br/>
                <span>Register Fitbit: <button style={{border:'1px solid black', borderRadius:'5px'}} onClick={this.setupFitbit}>Authorize Fitbit</button></span>
                <div>Fitbit Registered: {fbreg}</div>
            </div>
        </div>
        );
    }
}