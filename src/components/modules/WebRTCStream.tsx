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

const micOn = './assets/mic.svg';
const micOff = './assets/mic-off.svg';
const videoOn = './assets/webcam.svg';
const videoOff = './assets/webcam-off.svg';

export const createStreamChart = (call) => {
    return (
        <div>
            <ChartGroup
                streamId={call._id}
            />
        </div>
    )
}


class RTCAudio extends Component<{[key:string]:any}> {

    ctx = new AudioContext();
    call:RTCCallInfo;
    stream:MediaStream
    audioOutId:string;

    constructor(props:{
        stream:MediaStream, 
        call:RTCCallInfo,
        audioOutId:string //TODO: select output device for audio stream
}) {
        super(props);

        this.call = props.call;
        this.stream = props.stream;
        this.audioOutId = props.audioOutId;
    }

    async componentDidMount() {
        //todo fix using howler for this

        // let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        // let src = this.ctx.createMediaStreamSource(stream);
        let src = this.ctx.createMediaStreamSource(this.stream);

        let filterNode = this.ctx.createBiquadFilter();
        filterNode.type = 'lowshelf'; 
        filterNode.frequency.value = 1000;
        filterNode.gain.value = 1;

        let gainNode = this.ctx.createGain();
        src.connect(filterNode);
        filterNode.connect(gainNode); //src.connect(gainNode); // filterNode.connect(gainNode);
        gainNode.gain.value = 1;

        if (this.audioOutId) this.ctx.setSinkId(this.audioOutId)
        gainNode.connect(this.ctx.destination);

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

export const createAudioDiv = (call:WebRTCInfo, audioOutId: string) => {

    if((call as any).gainNode) {
        (call as any).gainNode.disconnect();
    }

    let found = call.streams?.find((s) => {
        if((s as MediaStream)?.getAudioTracks().length > 0) {
            return true;
        }
    })

    if(found) {
        return (<RTCAudio call={call} stream={found} audioOutId={audioOutId}/>);
    }
}

export class RTCVideo extends Component<{[key:string]:any}> {

    call:RTCCallInfo;
    stream:MediaStream;
    video;

    constructor(props:{stream:MediaStream, call:RTCCallInfo}) {
        super(props);

        this.call = props.call;
        this.stream = props.stream;

        navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
            this.stream = stream;
            this.forceUpdate()
        })

        let video = document.createElement('video');
        video.autoplay = true;
        this.video = video;
    }

    componentWillUnmount(): void {
        (this.video as HTMLVideoElement)?.remove();
    }

    render() {

        this.video.srcObject = this.stream as MediaStream;

        return (
            <div  ref={ (ref) => {
                ref?.appendChild(this.video);
            } }></div>
        )
    }
}

export const createVideoDiv = (call:WebRTCInfo) => {
    let found = call.streams?.find((s) => (s as MediaStream)?.getVideoTracks().length > 0);
    if(found) return <RTCVideo call={call} stream={found}/>
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
    audioInId?:string;
    videoInId?:string;
    audioOutId?:string;

    constructor(props:{
        streamId:string,        
        //from navigator.mediaDevices.enumerateDevices
        audioInId?:string,
        audioOutId?:string,
        videoInId?:string
    }) {
        super(props);

        this.audioInId = props.audioInId;
        this.audioOutId = props.audioOutId;
        this.videoInId = props.videoInId;


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

            const json = JSON.parse(ev.data);

            if (!json.message) {
                throw new Error(`Invalid message: ${ev.data}`);
            }
            
            // NOTE: This duplicates on rerender...
            this.messages.push(<div>
                {call.firstName} {call.lastName}: {json.message} | {new Date().toLocaleTimeString()}
            </div>);

            (document.getElementById(this.unique + 'messages') as HTMLElement).insertAdjacentHTML('beforeend',`<div>
                ${call.firstName} ${call.lastName}: ${json.message} | ${new Date().toLocaleTimeString()}
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
                audioTrackDiv:createAudioDiv(webrtc.rtc[call._id as any] as any, this.audioOutId)
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
            audioTrackDiv:createAudioDiv(call, this.audioOutId)
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
                let videoEnabledInAudio = false;
                if(s?.track?.kind === 'audio') {
                    hasAudio = true;
                    if((s as any).deviceId && this.audioInId && (s as any).deviceId !== this.audioInId) {
                        disableAudio(webrtc.rtc[this.state.activeStream as any] as any);
                        if(hasVideo && this.audioInId === this.videoInId) {
                            disableVideo(webrtc.rtc[this.state.activeStream as any] as any);
                            enableVideo(webrtc.rtc[this.state.activeStream as any] as any, this.videoInId ? {deviceId:this.videoInId} : undefined, true);
                            videoEnabledInAudio = true;
                        }
                        else enableAudio(webrtc.rtc[this.state.activeStream as any] as any, this.audioInId ? {deviceId:this.audioInId} : undefined);
                    }
                }
                if(s?.track?.kind === 'video') {
                    hasVideo = true;
                    if((s as any).deviceId && this.videoInId && (s as any).deviceId !== this.videoInId && !videoEnabledInAudio) {
                        disableVideo(webrtc.rtc[this.state.activeStream as any] as any);
                        enableVideo(webrtc.rtc[this.state.activeStream as any] as any, this.videoInId ? {deviceId:this.videoInId} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
                    }
                }
            })
        }

        console.log('hasAudio',hasAudio, 'hasVideo',hasVideo)
        return (
            <div id={this.unique + 'webrtcstream'} className='rtcStream'>{
                this.state.activeStream ? (
                <div>
                    <div className="rtcButtons">
                        {hasVideo ? <img src={videoOn} alt="Video On" onClick={() => {
                            disableVideo(webrtc.rtc[this.state.activeStream as any] as any);
                            this.forceUpdate()
                        }} /> : <img src={videoOff} alt="Video Off" onClick={() => {
                            enableVideo(webrtc.rtc[this.state.activeStream as any] as any, this.videoInId ? {deviceId:this.videoInId} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
                            this.forceUpdate()
                        }}/>}
                        {hasAudio ? <img src={micOn} alt="Microphone On" onClick={() => {
                            disableAudio(webrtc.rtc[this.state.activeStream as any] as any);
                            this.forceUpdate()
                        }}/> : <img src={micOff} alt="Microphone Off" onClick={() => {
                            if(hasVideo && this.audioInId === this.videoInId) {
                                disableVideo(webrtc.rtc[this.state.activeStream as any] as any);
                                enableVideo(webrtc.rtc[this.state.activeStream as any] as any, this.videoInId ? {deviceId:this.videoInId} : undefined, true);
                            }
                            else enableAudio(webrtc.rtc[this.state.activeStream as any] as any, this.audioInId ? {deviceId:this.audioInId} : undefined);
                            this.forceUpdate()
                        }}/>}
                    </div>
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