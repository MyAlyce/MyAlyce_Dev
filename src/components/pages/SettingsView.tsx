import { ProfileStruct } from 'graphscript-services/struct/datastructures/types';
import React from 'react';
import { client } from '../../scripts/client';
import { authorizeRedirect } from '../../scripts/fitbit';
import { Button } from '../lib/src';
import { sComponent } from '../state.component';
import { UserAuths } from '../UserAuths';

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
        <div className='div'>
            <h1>Settings</h1>
            <UserAuths/>

            <div>
                <h2>Other Settings</h2>
                <label>Add Team Member</label><input type='text'></input><Button onClick={this.addUser}>Add User</Button>
            </div>
        </div>
        );
    }
}