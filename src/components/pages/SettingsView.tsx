
import React from 'react';
import { client, logoutSequence } from '../../scripts/client';
import { authorizeRedirect } from '../../scripts/fitbit';
import { sComponent } from '../state.component';
import { UserAuths } from '../modules/User/UserAuths';

export class SettingsView extends sComponent  {

    state = { //synced with global state
        viewingId: undefined
    }

    setupFitbit() {
        authorizeRedirect();
    }

    addUser() {

    }

    deleteCurrentUser() {
        client.deleteUser(client.currentUser._id, true, () => {
            logoutSequence();
        });
    }

    render() {

        const data = client.currentUser
        // let viewing = client.getLocalData('profile',{_id:this.state.viewingId}) as ProfileStruct;

        let fbreg = false;
        if((data)?.fitbit?.access_token) {
            fbreg = true;
        }

        return (
            <div className='container-fluid settings'>
                    <h1>Settings</h1>
                    <UserAuths/>
            </div>
        );
    }
}