import React, {Component} from 'react';
import { sComponent } from '../state.component';

import { client, webrtc, graph, usersocket, state } from "../../scripts/client";

import {WebRTCInfo, WebRTCProps } from 'graphscript'// "../../../../graphscript/index";//

import {AuthorizationStruct, ProfileStruct} from 'graphscript-services/struct/datastructures/types'


import { ChartGroup } from "../modules/ChartGroup";
import { StreamSelect } from "../modules/StreamSelect";

import { Avatar, Button } from "../lib/src";


import { Howl, Howler } from "howler";
import { RTCCallInfo, RTCCallProps, disableAudio, disableVideo, enableAudio, enableDeviceStream, enableVideo } from '../../scripts/webrtc';

let personIcon = './assets/person.jpg';


export const createStreamChart = (call) => {
    return (
        <div>
            <ChartGroup
                streamId={call._id}
            />
        </div>
    )
}

let ctx:AudioContext;

export const createAudioDiv = (call:WebRTCInfo) => {

    if((call as any).gainNode) {
        (call as any).gainNode.disconnect();
    }

    let found = call.streams?.find((s) => {
        if((s as MediaStream)?.getAudioTracks().length > 0) {
            return true;
        }
    })

    if(found) {
        if(!ctx) ctx = new AudioContext();
        
        class RTCAudio extends Component<{[key:string]:any}> {

            call:RTCCallInfo;
            stream:MediaStream

            constructor(props:{stream:MediaStream, call:RTCCallInfo}) {
                super(props);

                this.call = props.call;
                this.stream = props.stream;
            }

            componentDidMount() {
                //todo fix using howler for this
                let src = ctx.createMediaStreamSource(this.stream as MediaStream);
                let filterNode = ctx.createBiquadFilter();
                // See https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#BiquadFilterNode-section
                filterNode.type = 'highpass';
                // Cutoff frequency. For highpass, audio is attenuated below this frequency.
                filterNode.frequency.value = 10000;

                let gainNode = ctx.createGain();
                src.connect(filterNode);
                filterNode.connect(gainNode);
                gainNode.connect(ctx.destination);
                gainNode.gain.value = 1;

                (this.call as any).srcNode = src;
                (this.call as any).filterNode = filterNode;
                (this.call as any).gainNode = gainNode;

            }

            componentWillUnmount(): void {
                (this.call as any).srcNode.disconnect();
            }

            render() {
                return (
                    <div>
                        <input type='range' min='0' max='1' step='0.01' defaultValue='1' onInput={(ev)=>{
                            (this.call as any).gainNode.gain.value = (ev.target as any).value }}></input>
                    </div>
                )
            }
        }
        
        return (<RTCAudio call={call} stream={found}/>);
        
    }
}

export const createVideoDiv = (call:WebRTCInfo) => {
    
    let found = call.streams?.find((s) => {
        if((s as MediaStream)?.getVideoTracks().length > 0) {
            return true;
        }
    });
    if(found){

        class RTCVideo extends Component<{[key:string]:any}> {

            call:RTCCallInfo;
            stream:MediaStream;
            video;

            constructor(props:{stream:MediaStream, call:RTCCallInfo}) {
                super(props);

                this.call = props.call;
                this.stream = props.stream;
            }

            componentDidMount(): void {
                let video = document.createElement('video');
                video.autoplay = true;
                video.srcObject = found as MediaStream;
                video.style.width = '300px';
                video.style.height = '300px';
                this.video = video;
            }

            componentWillUnmount(): void {
                (this.video as HTMLVideoElement)?.remove();
            }

            render() {
                return (
                    <div  ref={ (ref) => {
                        ref?.appendChild(this.video);
                    } }></div>
                )
            }
        }
        
        return <RTCVideo call={call} stream={found}/>
    }
}


export class WebRTCStream extends Component<{[key:string]:any}> {

    unique = `component${Math.floor(Math.random()*1000000000000000)}`;

    state = {
        chartDataDiv:undefined,
        videoTrackDiv:undefined,
        audioTrackDiv:undefined,
        activeStream:undefined as string|undefined
    };

    messages = [] as any[];

    constructor(props:{
        streamId:string
    }) {
        super(props);

        this.state.activeStream = props.streamId;
        if(webrtc.rtc[props.streamId]) this.setActiveStream(webrtc.rtc[props.streamId] as RTCCallInfo);
    }

    componentDidMount(): void {
        let call = webrtc.rtc[this.state.activeStream as string] as RTCCallInfo;
        this.setupCallUI(call);
    }

    componentWillUnmount(): void {
        let call = webrtc.rtc[this.state.activeStream as string] as RTCCallInfo;
        call.rtc.removeEventListener('datachannel',this.events.datachannel);

        if(call.channels) Object.keys(call.channels).forEach((key) => {
            (call.channels as any)[key].addEventListener('message',this.events.ondata);
        }) 

        call.rtc.removeEventListener('track', this.events.ontrack);
        
    }

    events = {} as any;

    setupCallUI(call:RTCCallInfo) {
        //overwrites the default message
        
        let ondata = (ev) => {
            this.messages.push(<div>
                {call.firstName} {call.lastName}: {ev.data.message} | {new Date().toLocaleTimeString()}
            </div>);

            (document.getElementById(this.unique + 'messages') as HTMLElement).insertAdjacentHTML('beforeend',`<div>
                ${call.firstName} ${call.lastName}: ${ev.data.message} | ${new Date().toLocaleTimeString()}
            </div>`);
        }

        let datachannel = (ev) => {
            //now add a device chart component
            this.setState({
                chartDataDiv:createStreamChart(call)
            });

            ev.channel.addEventListener('message',ondata);
        };

        call.rtc.addEventListener('datachannel',datachannel);

        if(call.channels) Object.keys(call.channels).forEach((key) => {
            (call.channels as any)[key].addEventListener('message',ondata);
        }) 
        

        let ontrack = (ev) => {
            //received a media track, e.g. audio or video
            //video/audio channel, if video add a video tag, if audio make the audio context
            console.log('track', ev);
            //if video, else if audio, else if video & audio
            if(ev.track.kind === 'video' && this.state.activeStream === call._id) this.setState({
                videoTrackDiv:createVideoDiv(webrtc.rtc[call._id as any] as any)
            });
            else if(ev.track.kind === 'audio' && this.state.activeStream === call._id) this.setState({
                audioTrackDiv:createAudioDiv(webrtc.rtc[call._id as any] as any)
            });
            
            ev.track.addEventListener('ended', () => {
                if(this.state.activeStream === call._id) {
                    if(ev.track.kind == 'audio') {
                        this.removeStreamAudio();
                    } 
                    if(ev.track.kind == 'video') {
                        this.removeStreamVideo();
                    }
                }
            });
        }

        call.rtc.addEventListener('track', ontrack);

        this.events = {
            ontrack:ontrack,
            datachannel:datachannel,
            ondata:ondata
        }

   }

    
    sendMessage(call:RTCCallInfo) {
        let message = (document.getElementById(this.unique+'sendmessage') as HTMLInputElement).value;
        call.send({message:message});
        if(!call.messages) call.messages = [] as any;
        call.messages.push({message:message, timestamp:Date.now(), from:client.currentUser.firstName + ' ' + client.currentUser.lastName});
        
        this.messages.push(<div>
            {client.currentUser.firstName} {client.currentUser.lastName}: {message} | {new Date().toLocaleTimeString()}
        </div>);
        
        (document.getElementById(this.unique + 'messages') as HTMLElement).insertAdjacentHTML('beforeend',`<div>
            ${client.currentUser.firstName} ${client.currentUser.lastName}: ${message} | ${new Date().toLocaleTimeString()}
        </div>`);
    }

    setActiveStream(call:RTCCallInfo) {
        if(!call) return;
        this.setState({
            chartDataDiv:createStreamChart(call),
            videoTrackDiv:createVideoDiv(call),
            audioTrackDiv:createAudioDiv(call)
        });
    }

    removeStreamVideo() {
        this.setState({
            videoTrackDiv:undefined
        });
    }

    removeStreamAudio() {
        this.setState({
            audioTrackDiv:undefined
        });
    }


    render() {

        let hasAudio;
        let hasVideo;
        let stream: RTCCallInfo|undefined = undefined;

        if(this.state.activeStream) {
            stream = webrtc.rtc[this.state.activeStream] as RTCCallInfo;
            
            stream?.senders?.forEach((s) => {
                if(s?.track?.kind === 'audio') {
                    hasAudio = true;
                }
                if(s?.track?.kind === 'video') {
                    hasVideo = true;
                }
            })
        }

        return (
            <div id={this.unique + 'webrtcstream'}>{
                this.state.activeStream ? (
                <div>
                    {hasVideo ? <Button onClick={() => {
                        disableVideo(webrtc.rtc[this.state.activeStream as any] as any);
                        this.render();
                    }}>Disable My Video</Button> : <Button onClick={() => {
                        enableVideo(webrtc.rtc[this.state.activeStream as any] as any);
                        this.render();
                    }}>Enable My Video</Button>}
                    {hasAudio ? <Button onClick={() => {
                        disableAudio(webrtc.rtc[this.state.activeStream as any] as any);
                        this.render();
                    }}>Disable My Audio</Button> : <Button onClick={() => {
                        enableAudio(webrtc.rtc[this.state.activeStream as any] as any);
                        this.render();
                    }}>Enable My Audio</Button>}
                    <div id={this.unique + 'datastream'}>
                        {  this.state.chartDataDiv ? this.state.chartDataDiv : ""    }
                    </div>
                    <div id={this.unique + 'videostream'}>
                        {  this.state.videoTrackDiv ? this.state.videoTrackDiv : ""  }
                    </div>
                    <div id={this.unique + 'audiostream'}>
                        {  this.state.audioTrackDiv ? this.state.audioTrackDiv : ""  }
                    </div>
                    <div id={this.unique + 'messages'}>
                        { this.messages ? this.messages.map(v => v): ""}
                    </div>
                    <input id={this.unique+'sendmessage'} type='text'></input><Button id={this.unique+'send'} onClick={()=>{this.sendMessage(stream as RTCCallInfo);}}>Send Message</Button>
            </div> 
            ) : "" }
        </div>
    );

    }


}