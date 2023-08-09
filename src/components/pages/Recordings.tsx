import React from 'react'
import { sComponent } from '../state.component'
import {client, getActiveStreamDir} from '../../scripts/client'
import { webrtc } from '../../scripts/client';
import { NoteTaking } from '../modules/Records/NoteTaking';
import { RTCCallInfo } from '../../scripts/webrtc';

import { RecordBar } from '../modules/Records/RecordBar';
import { RecordingsList } from '../modules/Records/RecordingsList';

//add google drive backup/sync since we're using google accounts

export class Recordings extends sComponent {

    state = {
        isRecording:false,
        activeStream:undefined
    }

    dir?:string;    

    constructor(props:{dir?:string}) {
        super(props);

        this.dir = props.dir;
    }
    
    render() {

        let dir = this.dir ? this.dir : getActiveStreamDir();

        return (
            <div className="main-content d-flex flex-column" style={{gap: '10px'}}>
                <NoteTaking 
                    streamId={ this.state.activeStream } 
                    filename={ this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv' } 
                    dir={ dir }
                    
                />
                <RecordBar
                    streamId={ this.state.activeStream }
                    dir = { dir }
                    onChange={()=>{this.setState({});}}   
                />
                <RecordingsList 
                    streamId={ this.state.activeStream }
                    dir = { dir }
                />
            </div>
        )

    }

}
