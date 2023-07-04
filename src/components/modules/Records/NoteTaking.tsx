import React, {Component} from 'react'
//import { workers } from "device-decoder";

//import gsworker from '../../../scripts/device.worker'
import { client, events, state, subscribeToStream, unsubscribeFromStream, webrtc, webrtcData } from '../../../scripts/client';

import Button from 'react-bootstrap/Button';
import { RTCCallInfo } from '../../../scripts/webrtc';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';
//import { WorkerInfo } from 'graphscript';
import { CardGroup, Table } from 'react-bootstrap';
//import { Card } from 'react-bootstrap';
import {  recordEvent } from '../../../scripts/datacsv';

import * as Icon from 'react-feather'
import { Widget } from '../../widgets/Widget';
import { toISOLocal } from 'graphscript-services.storage';
import { Stopwatch } from '../Stopwatch/Stopwatch';
import { NoteForm } from './NoteForm';

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

export class NoteTaking extends Component<{streamId?:string, filename?:string, dir?:string, showInput?:boolean, showHistory?:boolean, onSubmit?:(message:any)=>void}> {

    state = {
        noteRows:[] as any[],
        selectedTimeInput:'date',
        selectedEvent:undefined as any
    }

    id=`form${Math.floor(Math.random()*1000000000000000)}`;
    streamId?:string;

    startTime = Date.now();
    endTime = undefined;

    searchDict = undefined;
    eventLimit = 300;
    eventSkip = 0;
    savedEventOptions = state.data.savedEventOptions as string[];


    showInput = false;
    showHistory = true;

    ref1;ref2;ref3;

    sub;

    constructor(props:{streamId?:string, filename?:string, dir?:string, showInput?:boolean, showHistory?:boolean}) {
        super(props);

        if('showInput' in props) this.showInput = props.showInput as boolean;
        if('showHistory' in props) this.showHistory = props.showHistory as boolean;

        this.streamId = props.streamId;
        
        this.ref1 = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
    }

    componentDidMount(): void {
        this.sub = subscribeToStream('event',()=>{
            this.listEventHistory()
        }, this.streamId);
        if(this.showHistory) this.listEventHistory();
    }

    componentWillUnmount(): void {
        unsubscribeFromStream('event',this.sub,this.streamId);
    }

    async listEventHistory() {
        let latest;

        //todo: properly sort by timestamp
        if(this.streamId) {
            let call = (webrtc.rtc[this.streamId] as RTCCallInfo);
            latest = await client.getData('event', call.caller, this.searchDict, this.eventLimit, this.eventSkip); //these are gotten in order of the latest data
        } else {
            latest = await client.getData('event', client.currentUser._id, this.searchDict, this.eventLimit, this.eventSkip);
        }

        if(latest?.length > 0) {
            let noteRows = [] as any[];
            latest.forEach((event:EventStruct,i) => {
                if(!this.savedEventOptions.includes(formatWord(event.event))) {
                    this.savedEventOptions.push(event.event);
                }
                let onclick = () => {
                    client.deleteData([event],()=>{
                        this.listEventHistory();
                    })
                    noteRows[i] = null;
                    this.setState({});
                }
                
                noteRows.push({
                    event:event.event,
                    timestamp:event.timestamp,
                    html:(
                        <tr key={event.timestamp}>
                            <td>{new Date(parseInt(event.startTime as string)).toISOString()}</td>
                            <td width="15%">{event.event}</td>
                            <td width="35%">{event.notes}</td>
                            <td>{event.endTime ? (getHoursAndMinutes((event as any).endTime - (event as any).startTime)) : undefined}</td>
                            <td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.grade}</td> 
                            <td><button onClick={onclick}>❌</button></td>
                        </tr>
                    )
                });
            });


            this.setState({noteRows:noteRows});
        }

    }

    renderInputSection() {


        return (
            <Widget 
                style={{ maxWidth: '20rem' }}
                header={( <b>Log Event</b> )}
                content = {<>
                    <NoteForm
                        streamId={this.props.streamId}
                        onSubmit={this.props.onSubmit}
                    />
                </>}
            />
        );
    }


    //todo sort by event
    renderHistory() {
        return (
            <Widget 
                style={{ width: '40rem' }}
                header={( <>
                    <b>History</b>
                    <select style={{float:'right'}} onChange={(ev)=>{
                        this.setState({selectedEvent:ev.target.value})}}
                    >
                        <option value={0}>All</option>
                    {
                        this.savedEventOptions.map((v) => {
                            return <option value={v} key={v}>{v}</option>
                        })
                    }
                    </select>
                </>)}
                content={
                    <Table striped bordered hover style={{maxHeight:'600px'}}>
                        <tbody>
                            <tr>
                                <th><Icon.Clock/></th>
                                <th>Event</th>
                                <th>Notes</th>
                                <th>Duration?</th>
                                <th><Icon.TrendingUp/></th>
                                <th>
                                    <Button variant={'success'} 
                                        onClick={()=>{ 
                                            state.setState({[this.streamId ? this.streamId+'notemodal' : 'notemodal']:true}) 
                                        }}
                                    >➕</Button>
                                </th>
                            </tr>
                            {this.state.noteRows.map((v) => {
                                if(!v) return null;
                                if(this.state.selectedEvent) {
                                    if(this.state.selectedEvent == 0 || v.event.toLowerCase() === this.state.selectedEvent?.toLowerCase()) {
                                        return v.html;
                                    }
                                } else return v.html;
                            })}
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





function getHoursAndMinutes(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Convert the hours and minutes to two digits
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minutes}`;
}


function formatWord(str) {
    const firstLetter = str.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = str.slice(1).toLowerCase();
    return firstLetterCap + remainingLetters;
}