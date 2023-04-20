import React, {useRef, Component} from 'react'
import { workers } from "device-decoder";

import gsworker from '../../scripts/device.worker'
import { client, webrtc } from '../../scripts/client';
import { Button } from '../lib/src';
import { RTCCallInfo } from '../../scripts/webrtc';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';

function getColorGradientRG(value) {
    let r, g, b;

    if (value < 5) {
        r = Math.floor(200 * (value / 5));
        g = 200;
        b = 0;
    } else {
        r = 200;
        g = Math.floor(200 * (1 - (value - 5) / 5));
        b = 0;
    }
            
    return `rgb(${r}, ${g}, ${b})`;
}

export class NoteTaking extends Component<{[key:string]:any}> {

    state = {
        noteRows:[] as any[]
    }

    id=`form${Math.floor(Math.random()*1000000000000000)}`;
    csvworker = workers.addWorker({url:gsworker});
    filename;
    streamId?:string;

    ref1;ref2;ref3;

    constructor(props:{streamId?:string, filename?:string}) {
        super(props);
        if(props.streamId && !props.filename) {
            let call = webrtc.rtc[props.streamId] as RTCCallInfo;
            let name = call.firstName + '_' + call.lastName;
            props.filename = `data/Notes_${name}.csv`;
        }

        if(props.filename) this.filename = props.filename;
        else this.filename = `data/Notes${props.streamId ? '_'+props.streamId : ''}.csv`

        this.streamId = props.streamId;
        
        this.listEventHistory();
        
        this.ref1 = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
    }

    async listEventHistory() {
        let latest;
        if(this.streamId) {
            let call = (webrtc.rtc[this.streamId] as RTCCallInfo);
            latest = await client.getData('event', call.caller, undefined, 30); //these are gotten in order of the latest data
        } else {
            latest = await client.getData('event', client.currentUser._id, undefined, 30);
        }

        if(latest?.length > 0) {
            let noteRows = [] as any[];
            latest.forEach((event:EventStruct) => {
                noteRows.push(
                    <tr><td>{new Date(parseInt(event.timestamp as string)).toISOString()}</td><td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.notes}</td></tr>
                )
            });

            this.setState({noteRows:noteRows});
        }

    }

    submit = async () => {
        let note = {
            note:(document.getElementById(this.id+'note') as HTMLInputElement).value,
            timestamp:new Date((document.getElementById(this.id+'time') as HTMLInputElement).value).getTime(),
            grade:parseInt((document.getElementById(this.id+'number') as HTMLInputElement).value)
        };
        if(!note.timestamp) note.timestamp = Date.now();
        this.csvworker.run('appendCSV',[note, this.filename]);

        let event = await client.addEvent(
            client.currentUser, 
            client.currentUser._id, 
            note.note, 
            undefined,
            note.timestamp, 
            undefined, 
            note.grade 
        );

        this.state.noteRows.unshift(
            <tr key={event._id}><td>{new Date(parseInt(event.timestamp as string)).toISOString()}</td><td>{event.notes}</td><td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.grade}</td></tr>
        )
        
        this.setState({});
    }

    renderInputSection() {

        
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

        const updateInputColor = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(event.target.value);
            const color = getColorGradientRG(value);
            event.target.style.backgroundColor = color;
        }

        return (
            <div className="input-section">
                <label id={`${this.id}note`}>Event</label>
                <div><input ref={this.ref1 as any} id={this.id+'note'} name="note" type='text' defaultValue=""/></div>
                
                <label id={`${this.id}time`}>Time</label>
                <div><input ref={this.ref2 as any} id={this.id+'time'} name="time" type='datetime-local' defaultValue={localDatetime}/></div>
                
                <label id={`${this.id}number`}>Rating?</label>
                <div><input 
                        onInput={updateInputColor}
                        onChange={updateInputColor}
                        className="number-input" ref={this.ref3 as any} id={this.id+'number'} name="grade" type='number' min='0' max='10' defaultValue='0'></input></div>
                <br/>
                <Button onClick={this.submit}>Submit</Button>
            </div>
        );
    }

    render() {

        return (
            <div className="note-taking-module">
                {this.renderInputSection()}
                <br></br>
                <div className="history-section">
                    <h3>History:</h3>
                    <table className='table-wrapper'>
                        <tbody>
                            <tr><th>Time</th><th>Notes</th><th>Grade</th></tr>
                            {this.state.noteRows}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }



    // render() {

    //     var now = new Date();
    //     var utcString = now.toISOString().substring(0,19);
    //     var year = now.getFullYear();
    //     var month = now.getMonth() + 1;
    //     var day = now.getDate();
    //     var hour = now.getHours();
    //     var minute = now.getMinutes();
    //     //var second = now.getSeconds();
    //     var localDatetime = year + "-" +
    //                   (month < 10 ? "0" + month.toString() : month) + "-" +
    //                   (day < 10 ? "0" + day.toString() : day) + "T" +
    //                   (hour < 10 ? "0" + hour.toString() : hour) + ":" +
    //                   (minute < 10 ? "0" + minute.toString() : minute) +
    //                   utcString.substring(16,19);

    //     return (
    //         <div>
    //             Event: <input ref={this.ref1 as any} id={this.id+'note'} name="note" type='text' defaultValue=""/><br/>
    //             Time: <input ref={this.ref2 as any} id={this.id+'time'} name="time" type='datetime-local' defaultValue={localDatetime}/><br/>
    //             Grade?: <input ref={this.ref3 as any} id={this.id+'number'} name="grade" type='number' min='0' max='10' defaultValue='0'></input>
    //             <Button onClick={this.submit}>Submit</Button>
    //             History:
    //             <table>
    //                 <tbody>
    //                     <tr><th>Time</th><th>Notes</th></tr>
    //                     {this.state.noteRows}
    //                 </tbody>
    //             </table>
    //         </div>
    //     );
    // }

}