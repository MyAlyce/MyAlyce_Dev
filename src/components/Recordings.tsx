import React from 'react'
import { sComponent } from './state.component'

import {csvworker} from '../scripts/datacsv';

//add google drive backup/sync since we're using google accounts

export class Recordings extends sComponent {

    //list from db
    listRecordings() {
        let recordings = [] as any[];
        //get saved files in indexeddb
        //iterate and push divs with download & delete & backup
        //list backed up nonlocal files too? from gdrive
        let filelist = [];
        //getfilelist

        

        filelist.forEach((file) => {

            let download = () => {

            }

            let deleteFile = () => {

            }

            let backup = () => {

            }

            recordings.push (
                <div>
                    <span>{file}</span>
                    <button onClick={download}>Download</button>
                    <button onClick={deleteFile}>Delete</button>
                    <button onClick={backup}>Backup</button>
                </div>
            )
        });

        return recordings;
    }

    render() {

        return (
            <div>
                <button>Record</button>
                Recordings:
                <div>
                    {this.listRecordings().map(d => d)}
                </div>
            </div>
        )

    }

}
