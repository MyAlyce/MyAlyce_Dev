import React, { Component } from 'react'
import {client, events, getStreamById, state, webrtc, webrtcData} from '../../../scripts/client'
import { recordEvent } from '../../../scripts/datacsv';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';
import { Button } from 'react-bootstrap';
import { Stopwatch } from '../State/StateStopwatch'

import * as Icon from 'react-feather'
import { RTCCallInfo, getCallLocation } from '../../../scripts/webrtc';
import { getCurrentLocation } from '../../../scripts/alerts';

export class NoteForm extends Component<{
    userId?:string,
    streamId?:string, 
    onSubmit?:(message:any)=>void
}> {

    unique = `notemodal${Math.floor(Math.random()*1000000000000000)}`

    state = {
        writeIn:false,
        selectedTimeInput:'date',
        writeInUnits:false
    }

    defaultOptions = [
        'Event',
        'Vitals',
        'Sleep',
        'Mood',
        'Exercise',
        'Medication',
        'Social'
    ] as string[];
    
    savedEventOptions = state.data.savedEventOptions as string[];

    defaultUnits = [
        '',
        'minutes',
        'hours',
        'bpm',
        'feet',
        'miles',
        'mph',
        'meters',
        'kilometers',
        'kph',
    ];

    savedUnits = state.data.savedUnits as string[];

    gettingGPS = false;

    startTime = Date.now();
    endTime = undefined as any;
    ref:any; ref2:any; ref3:any

    streamId?:string;

    constructor(props:{streamId?:string, defaultShow?:boolean, onSubmit?:(message:any)=>void}) {
        super(props);
        this.ref = React.createRef();
        this.ref2 = React.createRef();
        this.ref3 = React.createRef();
        if(!state.data.selectedTimeInput) state.data.selectedTimeInput = 'date';
        this.streamId = props.streamId;
    }

    clearForm() {
        (document.getElementById(this.unique+'notes') as HTMLInputElement).value = '';
        (document.getElementById(this.unique+'grade') as HTMLInputElement).value = '0';
        (document.getElementById(this.unique+'value') as HTMLInputElement).value = '';
        this.startTime = Date.now();
        this.endTime = undefined;
        this.setState({});
    }

    submit = async () => {
        let event = {
            notes:(document.getElementById(this.unique+'notes') as HTMLInputElement).value,
            event:(document.getElementById(this.unique+'event') as HTMLInputElement).value,
            timestamp:this.startTime,
            grade:parseInt((document.getElementById(this.unique+'grade') as HTMLInputElement).value),
            value:(document.getElementById(this.unique+'value') as HTMLInputElement).value,
            units:(document.getElementById(this.unique+'units') as HTMLInputElement).value,
            location:(document.getElementById(this.unique+'location') as HTMLInputElement).value
        };
        if(!event.event) event.event = 'Event';
        else event.event = formatWord(event.event);
        if(!event.timestamp) event.timestamp = Date.now();

        
        if(this.state.writeIn) {

            if(!this.savedEventOptions.includes(event.event)) {
                this.savedEventOptions.push(
                    event.event
                );
                state.setState({savedEventOptions:this.savedEventOptions});
                //write saved options to file
            }
        }

        let userId;
        if(this.streamId) {
            let call = (webrtc.rtc[this.streamId] as RTCCallInfo);
            userId = call.caller; 
        } else if (this.props.userId) {
            userId = this.props.userId;
        } else {
            userId = client.currentUser?._id;
        }

        if(client.currentUser)
            await client.addEvent(
                { _id:userId }, 
                client.currentUser._id, 
                event.event, 
                event.notes,
                this.startTime, 
                this.endTime, 
                event.grade,
                event.value,
                event.units,
                event.location
            ) as EventStruct;

        
        let from;
        if(client.currentUser) {
            from = client.currentUser.firstName + client.currentUser.lastName;
        }

        let message = {
            from:from,
            event:event.event,
            notes:event.notes,
            grade:event.grade,
            value:event.value,
            units:event.units,
            location:event.location,
            startTime:this.startTime,
            endTime:this.endTime,
            timestamp:event.timestamp as number
        };

        for(const key in webrtcData.availableStreams) {
            webrtcData.availableStreams[key].send({event:message});
        }

        setTimeout(() => {
            recordEvent(from, message, this.streamId);

            events.push(message as any);

            if(this.props.onSubmit) {
                (this.props.onSubmit as any)(message);
            }
        },500)
        this.clearForm();
        this.setState({});
   
    }

    render() {

        
        let now = new Date();
        this.startTime = now.getTime();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        let localDateTime = now.toISOString().slice(0,16);


        return (
            <>
            <span><Icon.BookOpen/>{
                !this.state.writeIn ? 
                <select id={this.unique+"event"}>
                    { 
                        this.defaultOptions.map((v) => {
                            return <option value={v} key={v}>{v}</option>
                        })
                    }
                    {
                        this.savedEventOptions.map((v) => {
                            return <option value={v} key={v}>{v}</option>
                        })
                    }
                </select>
                : <>
                    <input type='text' placeholder="Event Name" id={this.unique+"event"}></input>
                    <button onClick={()=>{
                        let event = (document.getElementById(this.unique+"event") as any).value;
                        if(event && !this.savedEventOptions.includes(event)) {
                            this.savedEventOptions.push(
                                event
                            );
                            state.setState({savedEventOptions:this.savedEventOptions, writeIn:false});
                            //write saved options to file
                        }
                    }}>Set</button>
                </>
                }
                {
                    this.state.writeIn ? 
                    <Button onClick={()=>{this.setState({writeIn:false})}}>Back</Button> : 
                    <Button onClick={()=>{this.setState({writeIn:true})}}>New</Button>
                }
            </span>
            <br/>
            <label><Icon.Watch/></label>
            <select defaultValue={state.data.selectedTimeInput} onChange={(ev)=>{
                state.setState({selectedTimeInput: ev.target.value});
                this.setState({selectedTimeInput:ev.target.value});
            }}>
                <option value="timer">Timer</option>
                <option value="date">DateTime</option>
            </select>
            { state.data.selectedTimeInput === "date" &&  
                <>
                    <input
                        onChange={(ev)=>{
                            this.startTime = new Date(ev.target.value).getTime();
                        }}
                        style={{width:'65%'}}
                        ref={this.ref as any} id={this.unique+'time'} name="time" type='datetime-local' defaultValue={localDateTime}
                    />
                    <br/>
                    End?{' '}<input
                        onChange={(ev)=>{
                            this.endTime = new Date(ev.target.value).getTime();
                        }}
                        style={{width:'65%'}}
                        ref={this.ref as any} id={this.unique+'time'} name="time" type='datetime-local' defaultValue=""
                    />
                    {' '}<br/>
                </>
            }
            { state.data.selectedTimeInput === "timer" && 
                <Stopwatch 
                    stateKey={this.streamId}
                    onStart={(timestamp)=>{ this.startTime = timestamp; this.endTime = undefined; }}
                    onFrame={(duration, timestamp)=>{ this.endTime = timestamp; }}
                    onStop={(duration, timestamp)=>{ this.endTime = timestamp; }}
                    onClear={(duratiom, timestamp)=>{ this.startTime = timestamp; this.endTime = undefined; }}
                />
            }
            <br/>
            <label><Icon.PieChart/></label>{' '}
            <input
                id={this.unique + 'value'}
                type="text"
                placeholder="Value"
            />
            <span>
                {
                    !this.state.writeInUnits ? 
                    <select id={this.unique+"units"}>
                        { 
                            this.defaultUnits.map((v) => {
                                return <option value={v} key={v}>{v}</option>
                            })
                        }
                        {
                            this.savedUnits.map((v) => {
                                return <option value={v} key={v}>{v}</option>
                            })
                        }
                    </select>
                    : <>
                        <input
                            id={this.unique+'units'} //todo: make this a selector that saves options
                            type="text"
                            placeholder="Units"
                        />
                        <Button onClick={()=>{
                            let units = (document.getElementById(this.unique+"units") as any).value;
                            if(units && !this.savedUnits.includes(units)) {
                                this.savedUnits.push(
                                    units
                                );
                                state.setState({savedUnits:this.savedUnits, writeInUnits:false});
                                //write saved options to file
                            }
                        }}>Set</Button>
                    </>
                    }
                    {
                        this.state.writeInUnits ? 
                        <Button onClick={()=>{this.setState({writeInUnits:false})}}>Back</Button> : 
                        <Button onClick={()=>{this.setState({writeInUnits:true})}}>New</Button>
                    }
            </span>&nbsp;
            <label><Icon.TrendingUp/></label>{' '}
            <input 
                onInput={updateInputColor}
                onChange={updateInputColor}
                style={{width:'12%'}}
                className="number-input" 
                ref={this.ref3 as any} 
                id={this.unique+'grade'} 
                name="grade" 
                type='number' 
                min='0' 
                max='10' 
                defaultValue='0'
            />
            <br/>
            <label><Icon.MapPin/></label>
            <input id={this.unique+'location'} type="text"/><Button onClick={()=>{
                if(!this.gettingGPS) {
                    this.gettingGPS = true;
                    if(this.streamId) {
                            getCallLocation(getStreamById(this.streamId) as RTCCallInfo).then((result)=>{
                                this.gettingGPS = false;
                                (document.getElementById(this.unique+'location') as HTMLInputElement).value = `Lat:${result?.latitude};Lon:${result?.longitude}`;
                            });
                            
                    } else {
                        getCurrentLocation().then((result) => {
                            this.gettingGPS = false;
                            (document.getElementById(this.unique+'location') as HTMLInputElement).value = `Lat:${result?.latitude};Lon:${result?.longitude}`;
                        });
                    }
                }
            }}>GPS</Button>
            <br/>
            <label><Icon.Edit3/></label>{' '}
            <textarea ref={this.ref2 as any} id={this.unique+'notes'} placeholder="Take Notes..."  name="note" defaultValue="" style={{width:'87.5%'}}/>
            <Button style={{float:'right'}} onClick={this.submit}>Submit</Button>
            </>

        )
    }

}





const updateInputColor = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    const color = getColorGradientRG(value);
    event.target.style.backgroundColor = color;
}



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


function formatWord(str) {
    const firstLetter = str.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = str.slice(1).toLowerCase();
    return firstLetterCap + remainingLetters;
}