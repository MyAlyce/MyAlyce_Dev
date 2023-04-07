import { ProfileStruct } from 'graphscript-services/struct/datastructures/types';
import React from 'react';
import { client } from '../scripts/client';
import { authorizeRedirect } from '../scripts/fitbit';
import { Button } from './lib/src';
import { sComponent } from './state.component';
import { UserAuths } from './UserAuths';

export class SettingsView extends sComponent  {

    state = { //synced with global state
        viewingId: undefined
    }

    setupFitbit() {
        authorizeRedirect();
    }

    addUser() {

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
            <UserAuths/>
            <div>
                More fine grained permissions and opt-in stuff<br/>
                <span>Add Team Member</span><input type='text'></input><Button onClick={this.addUser}>Add User</Button>
                <span>Register Fitbit: <Button style={{border:'1px solid black', borderRadius:'5px'}} onClick={this.setupFitbit}>Authorize Fitbit</Button></span>
                <div>Fitbit Registered: {fbreg}</div>
            </div>
        </div>
        );
    }
}