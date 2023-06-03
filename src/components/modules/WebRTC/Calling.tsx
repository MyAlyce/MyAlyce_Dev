import React from "react"
import { Button } from "react-bootstrap"
import { client, getStreamById, state, webrtc } from "../../../scripts/client";
import { startCall, RTCCallInfo, RTCCallProps, answerCall, disableAudio, disableVideo, enableVideo, enableAudio } from "../../../scripts/webrtc";
import { ProfileStruct } from "graphscript-services/struct/datastructures/types";
import { sComponent } from "../../state.component";
import { Widget } from "../../widgets/Widget";
import { RTCVideo } from "./WebRTCStream";

import * as Icon from 'react-feather'


export function StartCall(user:Partial<ProfileStruct>) {
    return (
        <Button onClick={()=>{
            startCall(user._id).then(call => {
                //overwrites the default message
            })}}
        >Start Call</Button>
    )
}

export function UnanweredCallInfo(onAnswered?:(call:RTCCallInfo)=>{}) {
    let keys = Object.keys(state.data.unansweredCalls);

    let divs = [] as any;

    //console.log('getUnanweredCallInfo') //this should throw on the subscription event for receiveCallInformation

    for(const key of keys) {

        let call = state.data.unansweredCalls[key] as RTCCallProps;
 
        let divId = `call${call._id}`;

        divs.push(
            <div id={divId} key={divId}>
                <div>User: {call.firstName} {call.lastName}</div>
                <Button onClick={() => { 
                    answerCall(call as any).then(()=>{
                        if(onAnswered) onAnswered(webrtc.rtc[(call as any)._id] as RTCCallInfo); 
                    });} }>Join Call</Button>
            </div>
        );
    };


    return divs;
    //this.setState({});
    
}


export function Messaging(props:{streamId:string, renderMessages?:boolean, renderInput?:boolean}) {

    this.state = {
        messages:undefined
    }

    let stream = getStreamById(props.streamId);

    let renderMessages = props.renderMessages ? props.renderMessages : true;
    let renderInput = props.renderInput ? props.renderInput : true;

    let unique = `${Math.floor(Math.random()*1000000000000000)}`;
    let messages = [] as any[];

    function sendMessage(call:RTCCallInfo) {
        let message = (document.getElementById(unique+'sendmessage') as HTMLInputElement).value;
        call.send({message:message});
        if(!call.messages) call.messages = [] as any;
        call.messages.push({message:message, timestamp:Date.now(), from:client.currentUser.firstName + ' ' + client.currentUser.lastName});
        if(renderMessages) {
            messages.push(<div key={messages.length}>
                {client.currentUser.firstName} {client.currentUser.lastName}: {message} | {new Date().toLocaleTimeString()}
            </div>);
            
            this.setState({messages});
        }
    }

    return (<>
        { renderMessages ? <div id={unique + 'messages'}>
            {this.state.messages ? this.state.messages.map(v => v): ""}
        </div> : null }
        { renderInput ? <><input id={unique+'sendmessage'} type='text'></input><Button id={unique+'send'} onClick={()=>{ sendMessage(stream as RTCCallInfo); }}>Send Message</Button></> : null }
    </>);

    }

export function MessagingModal() {
        
}

export class ToggleAudioVideo extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    constructor(props:{streamId:string, audioOnClick?:(toggled:boolean)=>void,  videoOnClick?:(toggled:boolean)=>void}) {
        super(props);
    }

    render() {
        let stream = getStreamById(this.props.streamId) as RTCCallInfo;
        let hasAudio; let hasVideo;
    
        stream?.senders?.forEach((s) => {
            let videoEnabledInAudio = false;
            if(s?.track?.kind === 'audio') {
                hasAudio = true;
                if((s as any).deviceId && this.state.selectedAudioIn && (s as any).deviceId !== this.state.selectedAudioIn) {
                    disableAudio(stream);
                    if(hasVideo && this.state.selectedAudioIn === this.state.selectedVideo) {
                        disableVideo(stream);
                        enableVideo(stream, this.state.selectedVideo ? {deviceId:this.state.selectedVideo} : undefined, true);
                        videoEnabledInAudio = true;
                    }
                    else enableAudio(stream, this.state.selectedAudioIn ? {deviceId:this.state.selectedAudioIn} : undefined);
                }
            }
            if(s?.track?.kind === 'video') {
                hasVideo = true;
                if((s as any).deviceId && this.state.selectedVideo && (s as any).deviceId !== this.state.selectedVideo && !videoEnabledInAudio) {
                    disableVideo(stream);
                    enableVideo(stream, this.state.selectedVideo ? {deviceId:this.state.selectedVideo} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
                }
            }
        });
    
        return (
            <>
                {hasVideo ? <Icon.Video style={{cursor:'pointer'}} onClick={() => {
                    disableVideo(stream);
                    if(this.props.videoOnClick) this.props.videoOnClick(false);
                    this.forceUpdate();
                }} /> : <Icon.VideoOff style={{cursor:'pointer'}}  onClick={() => {
                    enableVideo(stream, this.state.selectedVideo ? {deviceId:this.state.selectedVideo} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
                    if(this.props.videoOnClick) this.props.videoOnClick(true);
                    this.forceUpdate();
                }}/>}
                {hasAudio ? <Icon.Mic style={{cursor:'pointer'}}  onClick={() => {
                    disableAudio(stream);
                    if(this.props.audioOnClick) this.props.audioOnClick(false);
                    this.forceUpdate();
                }}/> : <Icon.MicOff style={{cursor:'pointer'}}  onClick={() => {
                    if(hasVideo && this.state.selectedAudioIn === this.state.selectedVideo) {
                        disableVideo(stream);
                        enableVideo(stream, this.state.selectedVideo ? {deviceId:this.state.selectedVideo} : undefined, true);
                    }
                    else enableAudio(stream, this.state.selectedAudioIn ? {deviceId:this.state.selectedAudioIn} : undefined);
                    if(this.props.audioOnClick) this.props.audioOnClick(true);
                    this.forceUpdate();
                }}/>}
            </>
        );
    }
}

export class ViewSelfVideoStream extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    constructor(props:{streamId:string, style?:string, className?:string}) {
        super(props);
    }

    render() {
        let stream = getStreamById(this.props.streamId) as RTCCallInfo;

        let videoTrack;
    
        stream?.senders?.forEach((s) => {
            if(s?.track?.kind === 'audio') {
            }
            if(s?.track?.kind === 'video') {
                videoTrack = s.track;
            }
        });

        if(videoTrack) {
            let s = new MediaStream();
            s.addTrack(videoTrack);
            
            return (<RTCVideo stream={s} className={this.props.className} style={this.props.style}/>)
        } else 
            return null;


    }
}

//uses global state to handle propagation
export class MediaDeviceOptions extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    audioInDevices;
    audioOutDevices;
    cameraDevices;

    componentDidMount(): void {
        this.listMediaDevices();
    }

    listMediaDevices() {
        return new Promise((res,rej) => {
            navigator.mediaDevices.enumerateDevices()
            .then((deviceInfos) => { //https://github.com/garrettmflynn/intensities/blob/main/app/index.js
                let ain = [] as any[]; let aout = [] as any[]; let cam = [] as any[];
                for (var i = 0; i !== deviceInfos.length; ++i) {
                    var deviceInfo = deviceInfos[i];
                    var option = (<option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>{deviceInfo.label}</option>)//document.createElement('option');
                    //option.value = deviceInfo.deviceId;
                    //console.log(deviceInfo.kind, deviceInfo.deviceId);
                    if (deviceInfo.kind === 'videoinput') {
                        if(!this.state.selectedVideo) {
                            this.state.selectedVideo = deviceInfo.kind;
                        }
                        cam.push(option);
                        // option.text = deviceInfo.label || 'Camera ' +
                        //     (videoSelect.options.length + 1);
                        // this.camsrc.insertAdjacentElement('beforeend',option);
                    }
                    else if (deviceInfo.kind === 'audioinput') {
                        if(!this.state.selectedAudioIn) {
                            this.state.selectedAudioIn = deviceInfo.kind;
                        }
                        ain.push(option);
                        // option.text = deviceInfo.label ||
                        //     'Microphone ' + (audioInputSelect.options.length + 1);
                        // this.camsrc.insertAdjacentElement('beforeend',option);
                    } 
                    else if (deviceInfo.kind === 'audiooutput') {
                        if(!this.state.selectedAudioOut) {
                            this.state.selectedAudioOut = deviceInfo.kind;
                        }
                        aout.push(option);
                        // option.text = deviceInfo.label || 'Speaker ' +
                        //     (audioOutputSelect.options.length + 1);
                        //     this.camsrc.insertAdjacentElement('beforeend',option);
                    } 
                }

                this.audioInDevices=ain;
                this.audioOutDevices=aout;
                this.cameraDevices=cam;

                this.setState({});
    
                res({
                    audioInDevices:ain,
                    audioOutDevices:aout,
                    cameraDevices:cam
                });
    
            }).catch(rej);;
        })
    }
    
    render() {
        return (
            <Widget 
                title={"Voice and Video Options"}
                content={
                    <>
                        { this.audioInDevices?.length > 0 && ( <div>Mic In:    <select id={this.unique+'aIn'} onChange={(ev) => this.setState({selectedAudioIn: ev.target.value})}>{this.audioInDevices}</select>
                        </div>)}
                        { this.audioOutDevices?.length > 0 && (<div>Audio Out: <select id={this.unique+'aOut'} onChange={(ev) => this.setState({selectedAudioOut: ev.target.value})}>{this.audioOutDevices}</select> 
                        </div>)}
                        { this.cameraDevices?.length > 0 && (  <div>Camera In: <select id={this.unique+'vIn'} onChange={(ev) => this.setState({selectedVideo: ev.target.value})}>{this.cameraDevices}</select>
                        </div>)}
                    </>
                }
            />
                
        );  
    }
}

export class CallSelf extends sComponent {
        
    state={
        unansweredCalls:undefined
    }

    render() {
        let ownCall;

        if(state.data.unansweredCalls) {
            for(const key in state.data.unansweredCalls) {
                let call = state.data.unansweredCalls[key] as RTCCallProps;
                if(client.currentUser._id === call.caller) {
                    ownCall = call;
                }
            }
        }
    
        return <>
            <Button onClick={()=>{ startCall(client.currentUser._id).then(call => {})} }>
                Call Myself
            </Button>
            {
                ownCall && <Button onClick={()=>{ answerCall(ownCall).then(()=>{this.setState({ activeStream:ownCall._id, switchingUser:true });}); }}>Answer Self</Button>
            }
        </>
    }
    
}