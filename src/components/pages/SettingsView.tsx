
import React from 'react';
import { client } from '../../scripts/client';
import { authorizeRedirect } from '../../scripts/fitbit';
import { sComponent } from '../state.component';
import { UserAuths } from '../modules/UserAuths';

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

        const data = client.currentUser
        // let viewing = client.getLocalData('profile',{_id:this.state.viewingId}) as ProfileStruct;

        let fbreg = false;
        if((data)?.fitbit?.access_token) {
            fbreg = true;
        }

        return (
        <div className='container-fluid'>
                <h1>Settings</h1>
                <UserAuths/>
        </div>
        );
    }
}