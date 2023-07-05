import React, { Component } from 'react'
import {client, events, state, webrtc, webrtcData} from '../../../scripts/client'
import { recordEvent } from '../../../scripts/datacsv';
import { EventStruct } from 'graphscript-services/struct/datastructures/types';
import { Button } from 'react-bootstrap';
import { Stopwatch } from '../State/StateStopwatch'

import * as Icon from 'react-feather'
import { RTCCallInfo } from '../../../scripts/webrtc';

export class NoteForm extends Component<{
    userId?:string,
    streamId?:string, 
    onSubmit?:(message:any)=>void
}> {

    unique = `notemodal${Math.floor(Math.random()*1000000000000000)}`

    state = {
        writeIn:false,
        selectedTimeInput:'date'
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

    startTime = Date.now();
    endTime = undefined;
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
    }

    submit = async () => {
        let note = {
            notes:(document.getElementById(this.unique+'notes') as HTMLInputElement).value,
            event:(document.getElementById(this.unique+'event') as HTMLInputElement).value,
            timestamp:this.startTime,
            grade:parseInt((document.getElementById(this.unique+'grade') as HTMLInputElement).value)
        };
        if(!note.event) note.event = 'Event';
        else note.event = formatWord(note.event);
        if(!note.timestamp) note.timestamp = Date.now();

        
        if(this.state.writeIn) {

            if(!this.savedEventOptions.includes(note.event)) {
                this.savedEventOptions.push(
                    note.event
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
                note.event, 
                note.notes,
                this.startTime, 
                this.endTime, 
                note.grade 
            ) as EventStruct;

        
        let from;
        if(client.currentUser) {
            from = client.currentUser.firstName + client.currentUser.lastName;
        }

        let message = {
            from:from,
            event:note.event,
            notes:note.notes,
            grade:note.grade,
            startTime:this.startTime,
            endTime:this.endTime,
            timestamp:note.timestamp as number
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
                    <button onClick={()=>{this.setState({writeIn:false})}}>Back</button> : 
                    <button onClick={()=>{this.setState({writeIn:true})}}>New</button>
                }
            </span>
            <br/>
            <label><Icon.Clock/></label>
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
            <label><Icon.Edit3/></label>{' '}
            <textarea ref={this.ref2 as any} id={this.unique+'notes'} placeholder="Take Notes..."  name="note" defaultValue="" style={{width:'87.5%'}}/>
            <Button onClick={this.submit}>Submit</Button>
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