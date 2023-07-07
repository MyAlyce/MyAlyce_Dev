import React, {Component} from 'react'
//import { workers } from "device-decoder";

//import gsworker from '../../../scripts/device.worker'
import { client, getStreamById, state, subscribeToStream, unsubscribeFromStream, webrtc } from '../../../scripts/client';

import Button from 'react-bootstrap/Button';
import { RTCCallInfo } from '../../../scripts/webrtc';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';
//import { WorkerInfo } from 'graphscript';
import { CardGroup, Table } from 'react-bootstrap';
//import { Card } from 'react-bootstrap';

import * as Icon from 'react-feather'
import { Widget } from '../../widgets/Widget';
import { processDataForCSV } from 'graphscript-services.storage';//'../../../../../graphscript/src/extras/index.storage.services'//
import { NoteForm } from './NoteForm';
import { defaultSpecifiers, genTimestampFromString } from 'graphscript-services';
import { PopupModal } from '../Modal/Modal';

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

export class NoteTaking extends Component<{
    streamId?:string, 
    userId?:string,
    filename?:string, 
    dir?:string, 
    showInput?:boolean, 
    showHistory?:boolean, onSubmit?:(message:any)=>void
}> {

    state = {
        noteRows:[] as any[],
        selectedTimeInput:'date',
        selectedEvent:undefined as any,
        selectedCoords:undefined,
    }

    unique=`form${Math.floor(Math.random()*1000000000000000)}`;
    streamId?:string;
    userId?:string;

    time0 = 'week';
    time1 = 'now';

    startTime = Date.now();
    endTime = undefined;

    searchDict = undefined;
    eventLimit = 300;
    eventSkip = 0;
    savedEventOptions = state.data.savedEventOptions as string[];

    filteredEvents = [] as any[];


    showInput = false;
    showHistory = true;

    ref1;ref2;ref3;

    sub;

    constructor(props:{streamId?:string, userId?:string, filename?:string, dir?:string, showInput?:boolean, showHistory?:boolean}) {
        super(props);

        if('showInput' in props) this.showInput = props.showInput as boolean;
        if('showHistory' in props) this.showHistory = props.showHistory as boolean;

        this.streamId = props.streamId;
        this.userId = props.userId;
        
        this.ref1 = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
    }

    componentDidMount(): void {
        this.sub = subscribeToStream(
            'event',()=>{
            this.listEventHistory()
        }, this.streamId);
        if(this.showHistory) 
            this.listEventHistory();
    }

    componentWillUnmount(): void {
        unsubscribeFromStream('event', this.sub, this.streamId);
    }

    async listEventHistory() {
        let latest;

        if(this.time0 !== 'now' && this.time0.indexOf('last') < 0) this.time0 = 'last ' + this.time0;
        if(this.time1 !== 'now' && this.time1.indexOf('last') < 0) this.time1 = 'last ' + this.time1; 
        let t0 = genTimestampFromString(this.time0 as any);
        let t1 = genTimestampFromString(this.time1 as any);
        let searchDict = {timestamp:{$gt:t0, $lt:t1}};
        //todo: properly sort by timestamp
        if(this.streamId) {
            let call = (webrtc.rtc[this.streamId] as RTCCallInfo);
            latest = await client.getData('event', call.caller, searchDict, this.eventLimit, this.eventSkip); //these are gotten in order of the latest data
        } else if (this.userId) {
            latest = await client.getData('event', this.userId, searchDict, this.eventLimit, this.eventSkip); //these are gotten in order of the latest data
        } else {
            latest = await client.getData('event', client.currentUser._id, searchDict, this.eventLimit, this.eventSkip);
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
                    event:event,
                    timestamp:event.timestamp,
                    html:(
                        <tr key={event.timestamp}>
                            <td>{new Date(parseInt(event.startTime as string)).toISOString()}</td>
                            <td width="15%">{event.event}</td>
                            <td width="35%">{event.notes}</td>
                            <td>{event.endTime ? (getHoursAndMinutes((event as any).endTime - (event as any).startTime)) : undefined}</td>
                            <td style={{whiteSpace:'nowrap'}}>{event.value}{' '}{event.units}</td>
                            <td>{event.location ? <Icon.MapPin style={{cursor:'pointer'}} onClick={()=>{ 
                                let location = event.location.split(';');
                                let lat = location[0].split(':')[1];
                                let lon = location[1].split(':')[1];
                                this.setState({selectedCoords:`${lat},${lon}`});
                            }}/> : null}</td> 
                            <td style={{backgroundColor:getColorGradientRG(parseInt(event.grade as string))}}>{event.grade}</td> 
                            <td><button onClick={onclick}>❌</button></td>
                        </tr>
                    )
                });
            });


            this.setState({noteRows:noteRows});
        }

    }

    //todo sort by event
    renderHistory() {
        return (
            <Widget 
                style={{ width: '40rem' }}
                header={( <>
                    <b>History</b>&nbsp;
                    <Button onClick={()=>{
                        let name;
                        if(this.streamId) {
                            let call = getStreamById(this.streamId) as RTCCallInfo;
                            name = call.firstName + call.lastName;
                        } else {
                            name = client.currentUser.firstName + client.currentUser.lastName;
                        }
                        let csvdata = {
                            filename:'Events'+'_'+name,
                            save:true,
                            header:[
                                'timestamp', 'event', 'notes', 'grade', 'value', 'units', 'location', 'startTime', 'endTime'
                            ],
                            data:{
                                timestamp:[],
                                event:[],
                                notes:[],
                                grade:[],
                                value:[],
                                units:[],
                                location:[],
                                startTime:[],
                                endTime:[]
                            }
                        } as any;

                        for(const ev of this.filteredEvents) {
                            csvdata.data.timestamp.push(ev.timestamp !== undefined ? ev.timestamp : "");
                            csvdata.data.event.push(ev.event ? ev.event : "");
                            csvdata.data.notes.push(ev.notes ? ev.notes : "");
                            csvdata.data.grade.push(ev.grade !== undefined ? ev.grade : "");
                            csvdata.data.value.push(ev.value !== undefined ? ev.value : "");
                            csvdata.data.units.push(ev.units ? ev.units : "");
                            csvdata.data.location.push(ev.location ? ev.location : "");
                            csvdata.data.startTime.push(ev.startTime !== undefined ? ev.startTime : "");
                            csvdata.data.endTime.push(ev.endTime !== undefined ? ev.endTime : "");
                        }

                        processDataForCSV(csvdata);

                    }}>Download CSV</Button>
                    <span style={{float:'right'}}>
                        From:{' '}<select defaultValue={defaultSpecifiers.indexOf(this.time0 as any)} onChange={(ev)=>{
                            let time0 = document.getElementById(this.unique+'time0') as any;
                            let time1 = document.getElementById(this.unique+'time1') as any;
                            if(parseInt(time0.value) <= parseInt(time1.value)) time0.value = parseInt(time1.value)+1;
                            this.time0 = defaultSpecifiers[parseInt(time0.value)];
                            this.time1 = defaultSpecifiers[parseInt(time1.value)];
                            this.listEventHistory();
                        }} id={this.unique+'time0'}>{
                            [...defaultSpecifiers].map((v,i) => {
                                if(i !== 0) 
                                    return <option value={i} key={v}>{v == 'now' ? v : `last ${v}`}</option> 
                                else return null;
                            })
                        }</select>{' '}To:{' '}<select defaultValue={defaultSpecifiers.indexOf(this.time1 as any)} onChange={()=>{
                            let time0 = document.getElementById(this.unique+'time0') as any;
                            let time1 = document.getElementById(this.unique+'time1') as any;
                            if(parseInt(time0.value) <= parseInt(time1.value)) time0.value = parseInt(time1.value)+1;
                            this.time0 = defaultSpecifiers[parseInt(time0.value)];
                            this.time1 = defaultSpecifiers[parseInt(time1.value)];
                            this.listEventHistory();  
                        }} id={this.unique+'time1'}>{
                            [...defaultSpecifiers].map((v,i) => {
                                if(i !== defaultSpecifiers.length-1) 
                                    return <option value={i} key={v}>{v == 'now' ? v : `last ${v}`}</option> 
                                else return null;
                            })
                        }</select>
                        <select onChange={(ev)=>{
                            this.setState({selectedEvent:ev.target.value})}}
                        >
                            <option value={0}>All</option>
                        {
                            this.savedEventOptions.map((v) => {
                                return <option value={v} key={v}>{v}</option>
                            })
                        }
                        </select>
                    </span>
                </>)}
                content={
                    <>  
                        { this.state.selectedCoords && 
                            <PopupModal
                                defaultShow={true}
                                body={
                                <>
                                    <iframe width="100%" height="500px" style={{border:0}} loading="lazy" allowFullScreen={true}
                                        src={`https://www.google.com/maps/embed/v1/place?q=${this.state.selectedCoords}&key=AIzaSyDxBHuENbHVlbSj_v0ezWSqIw3JsxAsprc`}></iframe>
                                </>
                                }
                                onClose={()=>{this.setState({selectedCoords:undefined})}}
                            />
                        }
                        <Table striped bordered hover style={{maxHeight:'600px'}}>
                            <tbody>
                                <tr>
                                    <th><Icon.Clock/></th>
                                    <th>Event</th>
                                    <th>Notes</th>
                                    <th>Duration?</th>
                                    <th><Icon.BarChart/></th>
                                    <th><Icon.MapPin/></th>
                                    <th><Icon.TrendingUp/></th>
                                    {!this.showInput && <th>
                                        <Button variant={'success'} 
                                            onClick={()=>{ 
                                                state.setState({[this.streamId ? this.streamId+'notemodal' : 'notemodal']:true}) 
                                            }}
                                        >➕</Button>
                                    </th>}
                                </tr>
                                { this.state.noteRows.map((v, i) => {
                                    if(i === 0) this.filteredEvents.length = 0;
                                    if(!v) return null;
                                    if(this.state.selectedEvent) {
                                        if(this.state.selectedEvent == 0 || v.event.toLowerCase() === this.state.selectedEvent?.toLowerCase()) {
                                            this.filteredEvents.push(v.event);
                                            return v.html;
                                        }
                                    } else {
                                        this.filteredEvents.push(v.event);
                                        return v.html;
                                    }
                                })}
                            </tbody>
                        </Table>
                    </>
                }
            />
        )
    }


    renderInputSection() {


        return (
            <Widget 
                style={{ maxWidth: '20rem' }}
                header={( <b>Log Event</b> )}
                content = {<>
                    <NoteForm
                        userId={this.props.userId}
                        streamId={this.props.streamId}
                        onSubmit={this.props.onSubmit}
                    />
                </>}
            />
        );
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




function getHoursAndMinutes(milliseconds) {
    // Create a new Date object using the provided milliseconds
    let date = new Date(milliseconds);

    let hours = date.getUTCHours(); // Use getUTCHours to get hours in UTC
    let minutes = date.getUTCMinutes(); // Use getUTCMinutes to get minutes in UTC

    // Convert the hours and minutes to two digits
    hours = hours < 10 ? '0' + hours : hours as any;
    minutes = minutes < 10 ? '0' + minutes : minutes as any;

    return `${hours}:${minutes}`;
}


function formatWord(str) {
    const firstLetter = str.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = str.slice(1).toLowerCase();
    return firstLetterCap + remainingLetters;
}