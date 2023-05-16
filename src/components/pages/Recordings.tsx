import React from 'react'
import { sComponent } from '../state.component'
import {client, state, webrtc} from '../../scripts/client'

import { BFSRoutes, csvRoutes } from 'graphscript-services.storage';
import { driveInstance } from '../../scripts/client';
import { recordCSV, stopRecording } from '../../scripts/datacsv';
import { StreamSelect } from '../modules/StreamSelect';
import { Button } from '../lib/src';
import { NoteTaking } from '../modules/NoteTaking';
import { RTCCallInfo } from '../../scripts/webrtc';

//add google drive backup/sync since we're using google accounts

export class Recordings extends sComponent {

    state = {
        isRecording:false,
        recordings:undefined,
        activeStream:undefined
    }

    dir?:string

    constructor(props:{dir?:string}) {
        super(props);

        this.dir = props.dir;
        this.listRecordings();
    }

    //list from db
    async listRecordings() {
        let recordings = [] as any[];
        //get saved files in indexeddb
        //iterate and push divs with download & delete & backup
        //list backed up nonlocal files too? from gdrive

        let dir = this.dir ? this.dir : this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName +(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName;
        let filelist = await BFSRoutes.listFiles(dir); //list for a particular user
        //getfilelist

        
        filelist.forEach((file) => {

            let download = async () => {
                csvRoutes.writeToCSVFromDB(dir+'/'+file, 10); //download files in chunks (in MB). !0MB limit recommended, it will number each chunk for huge files
            }

            let deleteFile = () => {
                BFSRoutes.deleteFile(dir+'/'+file).then(() => {
                    this.listRecordings();
                });
            }

            let backup = () => {
                //google drive backup
                driveInstance?.backupToDrive(dir+'/'+file);
            }

            recordings.push (
                <div key={file}>
                    <span>{file}</span>
                    <Button onClick={download}>Download</Button>
                    <Button onClick={deleteFile}>Delete</Button>
                    <Button onClick={backup}>To Drive</Button>
                </div>
            )
        });

        this.setState({recordings});

        return recordings;
    }

    record(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[], subTitle?:string, dir?:string) {
        recordCSV(streamId, sensors, subTitle, dir);
    }

    async stopRecording(streamId?:string, dir?:string) {
        await stopRecording(streamId, dir);
        this.listRecordings();
    }

    render() {

        return (
            <div>
                <h1>Recording Manager</h1>
                <StreamSelect/>
                { this.state.isRecording ? <Button onClick={()=>{this.stopRecording(this.state.activeStream, this.dir ? this.dir : this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName +(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName  );}}>Stop Recording</Button> : <Button onClick={()=>{this.record(this.state.activeStream, undefined, undefined,  this.dir ? this.dir : this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName +(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName  );}}>Record</Button> }
                <br/>
                <NoteTaking streamId={this.state.activeStream} filename={this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv'} dir={ this.dir ? this.dir : this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName +(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName  }/>
                <h2>Recordings</h2>
                <div>
                    { this.state.recordings ? this.state.recordings : "" }
                </div>
            </div>
        )

    }

}
