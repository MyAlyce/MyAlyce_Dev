import React from 'react'
import { sComponent } from './state.component'

import { BFSRoutes, csvRoutes } from 'graphscript-services.storage';
import { driveInstance } from '../scripts/gapi';

//add google drive backup/sync since we're using google accounts

export class Recordings extends sComponent {

    state = {
        isRecording:false,
        recordings:undefined
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
                <div>
                    <span>{file}</span>
                    <button onClick={download}>Download</button>
                    <button onClick={deleteFile}>Delete</button>
                    <button onClick={backup}>To Drive</button>
                </div>
            )
        });

        this.setState({recordings});

        return recordings;
    }

    record() {
        let filePath = 'data/' + new Date().toISOString() 
    }

    stopRecording() {

    }

    render() {

        return (
            <div>
                { this.state.isRecording ? <button>Stop Recording</button> : <button>Record</button> }
                <br/>
                Recordings:
                <div>
                    { this.state.recordings ? this.state.recordings : "" }
                </div>
            </div>
        )

    }

}
