import React, {useRef, Component} from 'react'
import { workers } from "device-decoder";

import gsworker from '../../scripts/device.worker'
import { client, webrtc } from '../../scripts/client';
import Button from 'react-bootstrap/Button';
import { RTCCallInfo } from '../../scripts/webrtc';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';
import { WorkerInfo } from 'graphscript';
import { Table } from 'react-bootstrap';
import { Card } from 'react-bootstrap';

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
    csvworker:WorkerInfo;
    filename;
    streamId?:string;

    ref1;ref2;ref3;

    constructor(props:{streamId?:string, filename?:string, dir?:string}) {
        super(props);
        let dir = props.dir ? props.dir : 'data';
        if(props.streamId && !props.filename) {
            let call = webrtc.rtc[props.streamId] as RTCCallInfo;
            let name = call.firstName + '_' + call.lastName;
            props.filename = dir+`/Notes_${name}.csv`;
        }

        if(props.filename) this.filename = props.filename;
        else this.filename = dir+`/Notes${props.streamId ? '_'+props.streamId : ''}.csv`

        this.streamId = props.streamId;
        
        this.listEventHistory();
        
        this.ref1 = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
    }

    componentDidMount(): void {
        this.csvworker = workers.addWorker({url:gsworker})
    }

    componentWillUnmount(): void {
        this.csvworker?.terminate();
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

                let onclick = () => {
                    client.deleteData([event],()=>{
                        this.listEventHistory();
                    })
                }
                
                noteRows.push(
                    <tr key={event._id}>
                        <td>{new Date(parseInt(event.timestamp as string)).toISOString()}</td>
                        <td>{event.event}</td>
                        <td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.grade}</td> 
                        <td><button onClick={onclick}>❌</button></td>
                    </tr>
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

        
        let onclick = () => {
            client.deleteData([event],()=>{
                this.listEventHistory();
            })
        }


        this.state.noteRows.unshift(
            <tr key={event._id}>
                <td>{new Date(parseInt(event.timestamp as string)).toISOString()}</td>
                <td>{event.event}</td>
                <td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.grade}</td> 
                <td><button onClick={onclick}>❌</button></td>
            </tr>
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
                <Card bg='Light'>
                    <Card.Body>
                    <label>Event</label>
                    <div><input ref={this.ref1 as any} id={this.id+'note'} name="note" type='text' defaultValue=""/></div>
                    
                    <label>Time</label>
                    <div><input ref={this.ref2 as any} id={this.id+'time'} name="time" type='datetime-local' defaultValue={localDatetime}/></div>
                    
                    <label>Rating?</label>
                    <div><input 
                            onInput={updateInputColor}
                            onChange={updateInputColor}
                            className="number-input" ref={this.ref3 as any} id={this.id+'number'} name="grade" type='number' min='0' max='10' defaultValue='0'></input></div>
                    <br/>
                    <Button onClick={this.submit}>Submit</Button>
                    </Card.Body>
                </Card>
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
                    <Table striped bordered hover>
                        <tbody>
                            <tr><th>Time</th><th>Event</th><th>Grade</th><th></th></tr>
                            {this.state.noteRows}
                        </tbody>
                    </Table>
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