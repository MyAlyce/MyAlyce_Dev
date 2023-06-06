import React, {Component} from 'react';

import { SensorDefaults, client, webrtc } from "../../../scripts/client";

import { state } from '../../../scripts/client'

import { WebRTCInfo } from 'graphscript'// "../../../../graphscript/index";//

import { ChartGroup } from "../../modules/DataVis/ChartGroup";

import { Button } from "react-bootstrap";


import { RTCCallInfo, disableAudio, disableVideo, enableAudio,  enableVideo, getCallerAudioVideo, onrtcdata } from '../../../scripts/webrtc';

const micOn = './assets/mic.svg';
const micOff = './assets/mic-off.svg';
const videoOn = './assets/webcam.svg';
const videoOff = './assets/webcam-off.svg';

export const createStreamChart = (call, sensors?) => {
    return (
        <div>
            <ChartGroup
                streamId={call._id}
                sensors={sensors ? sensors : ['ppg','hr']}
            />
        </div>
    )
}

//TODO: Can't hear the audio from the other user
// also, add the exit call button

export class RTCAudio extends Component<{
    stream?:MediaStream, 
    call?:RTCCallInfo,
    audioOutId?:string //TODO: select output device for audio stream
}> {

    audioctx = new AudioContext();
    call?:RTCCallInfo;
    stream:MediaStream
    audioOutId?:string;
    

    gainNode;
    filterNode;
    srcNode;
    analyserNode;

    fftSize=256;
    
    canvas; ctx;
    animating = true;


    constructor(props:{
        stream?:MediaStream, 
        call?:RTCCallInfo,
        audioOutId?:string //TODO: select output device for audio stream
    }) {
        super(props);
        this.setupAudio();

        
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.backgroundColor = 'black';
        canvas.style.width = '100%';
        canvas.style.height = '200px';
        this.canvas = canvas;
        this.ctx = ctx;
    }

    setupAudio = (props=this.props) => {
                
        this.call = props.call;

        if(this.call && !props.stream) {
            this.stream = getCallerAudioVideo(this.call._id).audioStream;
        } else 
            this.stream = props.stream as MediaStream;

        //get own audio
        if(!props.call && !props.stream) 
            navigator.mediaDevices.getUserMedia({ video: false, audio: state.data.selectedAudioIn ? {deviceId:state.data.selectedAudioIn} : true }).then((stream) => { //get your own video if none specified
                this.stream = stream;
                state.subscribeEvent(
                    'selectedAudioIn', ()=>{
                        this.setupAudio(); this.setState({});
                    }
                );
                this.finishSetup();
                this.forceUpdate();
            });
        else this.finishSetup();


    }

    finishSetup = (props=this.props) => {
        
        this.audioOutId = props.audioOutId;
        
        if((this.call as any)?.gainNode) {
            (this.call as any)?.gainNode.disconnect();
        }

        // let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        // let src = this.ctx.createMediaStreamSource(stream);

        //hack for chrome bug
        if(props.call && navigator.userAgent.match(/chrome|chromium|crios/i)) {
            let a = new Audio();
            a.muted = true;
            a.srcObject = this.stream;
            a.addEventListener('canplaythrough', () => {
                a = null as any;
            });
        }

        //use audio context for local control
        
        let src = this.audioctx.createMediaStreamSource(this.stream);

        let filterNode = this.audioctx.createBiquadFilter();
        filterNode.type = 'lowshelf'; 
        filterNode.frequency.value = 1000;

        let gainNode = this.audioctx.createGain();
        src.connect(filterNode);
        filterNode.connect(gainNode); //src.connect(gainNode); // filterNode.connect(gainNode);
        
        //
        //gainNode.gain.value = 1; 
        if(!props.call && !props.stream) gainNode.gain.value = 0;
        else gainNode.gain.value = 1;

        if (this.audioOutId) try {(this.audioctx as any).setSinkId(this.audioOutId)} catch(er) {}
        gainNode.connect(this.audioctx.destination);

        let analyser = this.audioctx.createAnalyser();
        filterNode.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;

        setTimeout(() => {
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray)
            //console.log('byte frequency data', dataArray);
        }, 2000)

        this.srcNode = src;
        this.filterNode = filterNode;
        this.gainNode = gainNode;
        this.analyserNode = analyser;

        if(this.call) this.call.gainNode = gainNode;
        

    }


    animation;

    componentDidMount() {
        this.animating = true;
    }

    componentWillUnmount(): void {
        this.gainNode?.disconnect();
        this.srcNode?.disconnect();
        this.animating = false;
        if(this.animation) cancelAnimationFrame(this.animation);
    }


    render() {


        let canvas = this.canvas;
        let ctx = this.ctx; 

        return (
            <div>
                {this.gainNode && 
                    <>
                        <span ref={(ref)=>{
                            ref?.appendChild(canvas);

                            let animLoop = () => {
                                if(this.analyserNode && this.animating) {
                                    const bufferLength = this.analyserNode.frequencyBinCount;
                                    const dataArray = new Uint8Array(bufferLength);
                                    this.analyserNode.getByteFrequencyData(dataArray);
                                    
                                    ctx.clearRect(0,0,canvas.width,canvas.height);

                                    ctx.strokeStyle = 'green';
                                    ctx.beginPath();
                                    ctx.moveTo(0,0);
                                    for(let i = 0; i < bufferLength; i++) {
                                        ctx.lineTo(canvas.width*i/bufferLength, canvas.height - canvas.height*dataArray[i]/256 )
                                    }   
                                    ctx.stroke();

                                    this.animation = requestAnimationFrame(animLoop);
                                }
                            }

                            this.animation = requestAnimationFrame(animLoop);

                        }} ></span>
                        <input type='range' min='0' max='1' step='0.01' defaultValue={this.gainNode.gain.value} onInput={(ev)=>{
                            this.gainNode.gain.value = (ev.target as any).value }}></input>
                    </>
                }
            </div>
        )
    }
}

export const createAudioDiv = (call:RTCCallInfo, audioOutId?: string) => {

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

export class RTCVideo extends Component<{stream?:MediaStream, call?:RTCCallInfo, style?:any, className?:string}> {

    call?:RTCCallInfo;
    stream:MediaStream;
    video;

    constructor(props:{stream?:MediaStream, call?:RTCCallInfo, style?:any, className?:string}) {
        super(props);

        this.call = props.call;
        if(this.call && !props.stream) {
            this.stream = getCallerAudioVideo(this.call._id).videoStream;
        } else 
            this.stream = props.stream as MediaStream;

        //getOwnMedia
        if(!this.call && !this.stream) navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => { //get your own video if none specified
            this.stream = stream;
            this.forceUpdate();
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

        //fill span, let span decide style
        this.video.style.height = "100%";
        this.video.style.width = "100%";
        (this.video as HTMLVideoElement).volume = 1;
        (this.video as HTMLVideoElement).muted = false;

        return (
            <span 
                style={this.props.style ? this.props.style : {width:"360px", height:"240px"}}
                className={this.props.className}
                ref={ (ref) => {
                    ref?.appendChild(this.video);
                } }
            />
        )
    }
}

export const createVideoDiv = (call:RTCCallInfo) => {
    let found = call.streams?.find((s) => (s as MediaStream)?.getVideoTracks().length > 0);
    if(found) return <RTCVideo call={call} stream={found}/>
}



//old
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
    streamId:string;

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

    }

    componentDidMount(): void {
        this.state.activeStream = this.props.streamId;
        if(webrtc.rtc[this.props.streamId]) this.setActiveStream(webrtc.rtc[this.props.streamId] as RTCCallInfo);
        let call;
        if(this.state.activeStream) call = webrtc.rtc[this.state.activeStream as string] as RTCCallInfo;
        if(call) this.setupCallUI(call);
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
        
        const from = (call as RTCCallInfo).firstName + (call as RTCCallInfo).lastName;

        let ondata = (dev) => {

            const json = JSON.parse(dev.data);
            
            // NOTE: This duplicates on rerender...
            if(json.message) {
                this.messages.push(<div key={this.messages.length}>
                    {call.firstName} {call.lastName}: {json.message} | {new Date().toLocaleTimeString()}
                </div>);
    
                (document.getElementById(this.unique + 'messages') as HTMLElement).insertAdjacentHTML('beforeend',`<div  key="${this.messages.length}">
                    ${call.firstName} ${call.lastName}: ${json.message} | ${new Date().toLocaleTimeString()}
                </div>`);
            }
            onrtcdata(call, from, json);
        }

        let datachannel = (ev) => {
            //now add a device chart component
            this.setState({
                chartDataDiv:createStreamChart(call)
            });
        };

        if(call.ondatachannel) {
            let oldondatachannel = call.ondatachannel;
            let fn = datachannel;
            datachannel = (ev) => {
                (oldondatachannel as any)(ev);
                fn(ev);
            }
        } else call.ondatachannel = datachannel;

        call.ondata = ondata;

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
        
        this.messages.push(<div key={this.messages.length}>
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

        console.log('hasAudio', hasAudio, 'hasVideo', hasVideo); //audio is bugged

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