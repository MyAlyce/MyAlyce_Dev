import React, {Component} from 'react'
import { workers } from "device-decoder";

import gsworker from '../../../scripts/device.worker'
import { client, events, webrtc, webrtcData } from '../../../scripts/client';

import Button from 'react-bootstrap/Button';
import { RTCCallInfo } from '../../../scripts/webrtc';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';
import { WorkerInfo } from 'graphscript';
import { CardGroup, Table } from 'react-bootstrap';
import { Card } from 'react-bootstrap';
import {  recordEvent } from '../../../scripts/datacsv';

import * as Icon from 'react-feather'
import { Widget } from '../../widgets/Widget';

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
    streamId?:string;

    showInput = true;
    showHistory = true;

    ref1;ref2;ref3;

    constructor(props:{streamId?:string, filename?:string, dir?:string, showInput?:boolean, showHistory?:boolean}) {
        super(props);

        if('showInput' in props) this.showInput = props.showInput as boolean;
        if('showHistory' in props) this.showHistory = props.showHistory as boolean;

        this.streamId = props.streamId;
        
        if(this.showHistory) this.listEventHistory();
        
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

                let onclick = () => {
                    client.deleteData([event],()=>{
                        this.listEventHistory();
                    })
                }
                
                noteRows.push(
                    <tr key={event._id}>
                        <td>{new Date(parseInt(event.timestamp as string)).toISOString()}</td>
                        <td width="15%">{event.event}</td>
                        <td width="35%">{event.notes}</td>
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
            notes:(document.getElementById(this.id+'note') as HTMLInputElement).value,
            event:(document.getElementById(this.id+'event') as HTMLInputElement).value,
            timestamp:new Date((document.getElementById(this.id+'time') as HTMLInputElement).value).getTime(),
            grade:parseInt((document.getElementById(this.id+'number') as HTMLInputElement).value)
        };
        if(!note.timestamp) note.timestamp = Date.now();

        let event;
        if(client.currentUser)
            event = await client.addEvent(
            client.currentUser, 
            client.currentUser._id, 
            note.event, 
            note.notes,
            note.timestamp, 
            undefined, 
            note.grade 
        ) as EventStruct;

        let from;
        if(this.streamId) {
            from = webrtcData.availableStreams[this.streamId].firstName + webrtcData.availableStreams[this.streamId].lastName;
        } else {
            from = client.currentUser.firstName + client.currentUser.lastName;
        }

        let message = {
            from:from,
            event:note.event,
            notes:note.notes,
            grade:note.grade,
            timestamp:note.timestamp as number
        };

        for(const key in webrtcData.availableStreams) {
            webrtcData.availableStreams[key].send({event:message});
        }

        recordEvent(from, message, this.streamId);

        events.push(message as any);

        if(event) {

            let onclick = () => {
                client.deleteData([event],()=>{
                    this.listEventHistory();
                });
            }

            this.state.noteRows.unshift(
                <tr key={event._id}>
                    <td>{new Date(parseInt(event.timestamp as string)).toISOString()}</td>
                    <td>{event.event}</td>
                    <td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.grade}</td> 
                    <td><button onClick={onclick}>❌</button></td>
                </tr>
            );
    
        }
        
        this.setState({});
    }

    renderInputSection() {

        let now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        let localDateTime = now.toISOString().slice(0,16);
        
        const updateInputColor = (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = parseInt(event.target.value);
            const color = getColorGradientRG(value);
            event.target.style.backgroundColor = color;
        }

        return (
            <Widget 
                style={{ maxWidth: '20rem' }}
                header={"Log Event"}
                content = {<>
                    <div>
                        <label><Icon.BookOpen/></label>{' '}<input ref={this.ref1 as any} id={this.id+'event'} placeholder="Event"  name="event" defaultValue="" style={{width:'87.5%'}}/>
                    </div>
                    
                    <label><Icon.Edit3/></label>{' '}<textarea ref={this.ref1 as any} id={this.id+'note'} placeholder="Notes..."  name="note" defaultValue="" style={{width:'87.5%'}}/>
                    <div>
                        <label><Icon.TrendingUp/></label>{' '}
                        <input 
                            onInput={updateInputColor}
                            onChange={updateInputColor}
                            style={{width:'12%'}}
                            className="number-input" ref={this.ref3 as any} id={this.id+'number'} name="grade" type='number' min='0' max='10' defaultValue='0'
                        />
                        {' '}<label><Icon.Clock/></label>{' '}
                        <input
                            style={{width:'65%'}}
                            ref={this.ref2 as any} id={this.id+'time'} name="time" type='datetime-local' defaultValue={localDateTime}/>
                        {' '}<br/>
                        <Button style={{float:'right'}} onClick={this.submit}>Submit</Button>
                    </div>
                </>}
            />
        );
    }

    renderHistory() {
        return (
            <Widget 
                style={{ width: '40rem' }}
                header={"History:"}
                content={
                    <Table striped bordered hover>
                        <tbody>
                            <tr><th><Icon.Clock/></th><th>Event</th><th>Notes</th><th><Icon.TrendingUp/></th><th></th></tr>
                            {this.state.noteRows}
                        </tbody>
                    </Table>
                }
            />
        )
    }

    render() {

        return (
            <div className="note-taking-module">
                <CardGroup>
                    {this.showInput ? this.renderInputSection() : null}
                    {this.showHistory ? this.renderHistory() : null}
                </CardGroup>
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