import React from 'react'
import { sComponent } from './state.component'
import { workers } from "device-decoder";

import { state } from "graphscript";
import gsworker from '../scripts/device.worker'
import { client } from '../scripts/client';

export class NoteTaking extends sComponent {

    id=`form${Math.floor(Math.random()*1000000000000000)}`;
    csvworker = workers.addWorker({url:gsworker});
    filename;

    constructor(streamId, filename?) {
        super();
        if(filename) this.filename = filename;
        else this.filename = `data/Notes_${new Date().toISOString()}${streamId ? '_'+streamId : ''}.csv`

        this.csvworker.run('createCSV', [
            this.filename,
            [
                'timestamp',
                'note'
            ]
        ]);
    }

    submit = () => {
        let note = {
            title:(document.getElementById(this.id+'title') as HTMLInputElement).value,
            note:(document.getElementById(this.id+'note') as HTMLInputElement).value,
            timestamp:new Date((document.getElementById(this.id+'number') as HTMLInputElement).value).getTime(),
            grade:parseInt((document.getElementById(this.id+'number') as HTMLInputElement).value)
        }
        this.csvworker.run('appendCSV',[note, this.filename]);

        client.addEvent(
            client.currentUser, 
            client.currentUser._id, 
            note.title, 
            note.note, 
            note.timestamp, 
            undefined, 
            note.grade 
        );
    }

    render() {
        return (
        <div>
            Note: <input id={this.id+'note'} type='text'/><br/>
            Time: <input id={this.id+'time'} type='datetime-local' value={Date.now()}/><br/>
            Grade?: <input id={this.id+'number'} type='number' min='0' max='10'></input>
            Title?: <input id={this.id+'title'} type='text'/><br/>
            <button onClick={this.submit}>Submit</button>
        </div>)
    }

}