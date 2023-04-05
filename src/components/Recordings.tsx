import React from 'react'
import { sComponent } from './state.component'
import {state} from 'graphscript'

import { BFSRoutes, csvRoutes } from 'graphscript-services.storage';
import { driveInstance } from '../scripts/gapi';
import { recordCSV, stopRecording } from '../scripts/datacsv';
import { StreamSelect } from './StreamSelect';
import { Button } from './lib/src';

//add google drive backup/sync since we're using google accounts

export class Recordings extends sComponent {

    state = {
        isRecording:false,
        recordings:undefined,
        activeStream:undefined
    }

    constructor() {
        super();
        this.listRecordings();
    }

    //list from db
    async listRecordings() {
        let recordings = [] as any[];
        //get saved files in indexeddb
        //iterate and push divs with download & delete & backup
        //list backed up nonlocal files too? from gdrive
        let filelist = await BFSRoutes.listFiles('data');
        //getfilelist

        
        filelist.forEach((file) => {

            let download = async () => {
                csvRoutes.writeToCSVFromDB(file, 10); //download files in chunks (in MB). !0MB limit recommended, it will number each chunk for huge files
            }

            let deleteFile = () => {
                BFSRoutes.deleteFile(file).then(() => {
                    this.listRecordings();
                });
            }

            let backup = () => {
                //google drive backup
                driveInstance?.backupToDrive(file);
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

    record(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[]) {
        recordCSV(streamId, sensors);
    }

    stopRecording(streamId?:string) {
        stopRecording(streamId);
    }

    render() {

        return (
            <div>
                <StreamSelect/>
                { this.state.isRecording ? <Button onClick={()=>{this.stopRecording(this.state.activeStream);}}>Stop Recording</Button> : <Button onClick={()=>{this.record(this.state.activeStream);}}>Record</Button> }
                <br/>
                Recordings:
                <div>
                    { this.state.recordings ? this.state.recordings : "" }
                </div>
            </div>
        )

    }

}
