import React, {useRef} from 'react'
import { sComponent } from './state.component'
import { workers } from "device-decoder";

import gsworker from '../scripts/device.worker'
import { client } from '../scripts/client';
import { Button } from './lib/src';

export class NoteTaking extends sComponent {

    id=`form${Math.floor(Math.random()*1000000000000000)}`;
    csvworker = workers.addWorker({url:gsworker});
    filename;

    ref1;ref2;ref3;

    constructor(props:{streamId?:string, filename?:string}) {
        super(props);
        if(props.filename) this.filename = props.filename;
        else this.filename = `data/Notes_${new Date().toISOString()}${props.streamId ? '_'+props.streamId : ''}.csv`

        this.ref1 = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
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
            note.note, 
            undefined,
            note.timestamp, 
            undefined, 
            note.grade 
        );
    }

    render() {

        var now = new Date();
        var utcString = now.toISOString().substring(0,19);
        var year = now.getFullYear();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        //var second = now.getSeconds();
        var localDatetime = year + "-" +
                      (month < 10 ? "0" + month.toString() : month) + "-" +
                      (day < 10 ? "0" + day.toString() : day) + "T" +
                      (hour < 10 ? "0" + hour.toString() : hour) + ":" +
                      (minute < 10 ? "0" + minute.toString() : minute) +
                      utcString.substring(16,19);

        return (
            <div>
                Event: <input ref={this.ref1 as any} id={this.id+'note'} name="note" type='text' defaultValue=""/><br/>
                Time: <input ref={this.ref2 as any} id={this.id+'time'} name="time" type='datetime-local' defaultValue={localDatetime}/><br/>
                Grade?: <input ref={this.ref3 as any} id={this.id+'number'} name="grade" type='number' min='0' max='10' defaultValue='0'></input>
                <Button onClick={this.submit}>Submit</Button>
            </div>
        );
    }

}