import { client, webrtc, graph, usersocket } from "../../scripts/client";
import { state, } from 'graphscript'//"../../../../graphscript/index";//

import {WebRTCInfo, WebRTCProps } from'graphscript'// "../../../../graphscript/index";//

import {AuthorizationStruct, ProfileStruct} from 'graphscript-services/struct/datastructures/types'
import React from 'react'
import { sComponent } from '../state.component';


import { RTCCallProps, RTCCallInfo, answerCall, enableDeviceStream, startCall, disableVideo, enableVideo, disableAudio, enableAudio  } from "../../scripts/webrtc";
import { Chart } from "../Chart";
import { StreamSelect } from "../StreamSelect";
import { Avatar, Button } from "../lib/src";
import { Howl, Howler } from "howler";
import { ChartGroup } from "../ChartGroup";

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
        
        //todo fix using howler for this
        let src = ctx.createMediaStreamSource(found);
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

        (call as any).gainNode = gainNode;
        
        return (
            <div>
                <input type='range' min='0' max='1' step='0.01' defaultValue='1' onInput={(ev)=>{
                    gainNode.gain.value = (ev.target as any).value }}></input>
            </div>
        )
    }
}

export const createVideoDiv = (call:WebRTCInfo) => {
    
    let found = call.streams?.find((s) => {
        if((s as MediaStream)?.getVideoTracks().length > 0) {
            return true;
        }
    });
    if(found){
        let video = document.createElement('video');
        video.autoplay = true;
        video.srcObject = found as MediaStream;
        video.style.width = '300px';
        video.style.height = '300px';

        return (
            <div  ref={ (ref) => {
                ref?.appendChild(video);
            } }></div>
        )
    }
}

export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined as undefined|any[],
        availableStreams:webrtc.rtc, //we can handle multiple connections too
        unansweredCalls:webrtc.unanswered, //webrtc.unanswered reference
        unansweredCallDivs:[] as any[],
        chartDataDiv:undefined,
        videoTrackDiv:undefined,
        audioTrackDiv:undefined,
        activeStream:undefined //stream/user in focus
    }

    listed = {};
    subscriptions = {} as any;
    evSub; streamSelectSub;
    messages = [] as any;

    constructor(props:{streamId?:string}) {
        super(props);
    }

    componentDidMount = () => {
        this.getUsers();
        this.getUnanweredCallInfo();
        this.evSub = state.subscribeEvent('receiveCallInformation',()=>{
            this.getUnanweredCallInfo();
        });
        this.streamSelectSub = state.subscribeEvent('activeStream',(id?)=>{
            if(id) {
                this.setActiveStream(this.state.availableStreams[id] as RTCCallInfo);
            }
        });
    }

    componentWillUnmount = () => {
        state.unsubscribeEvent('receiveCallInformation', this.evSub);
    }

    async getUsers() {
        //todo: use user list supplied by authorizations rather than global server visibility (but this is just a test)
        let auths = client.getLocalData('authorization', {authorizedId:client.currentUser._id});
        
        let pushed = [] as any;
        let checkIds = auths.map((a:AuthorizationStruct) => {
            if(!pushed.includes(a.authorizerId)) {
                pushed.push(a.authorizerId);
                return true;
            }
        });

        let userIds = await usersocket.run('getAllOnlineUsers', [checkIds]);

        userIds.push(client.currentUser._id);

        let userInfo = await client.getUsers(userIds, true);
        if(userInfo) {
            let divs = [] as any[];
            userInfo.forEach((user:Partial<ProfileStruct>) => {
                //console.log(user);
                divs.push( //turn into a dropdown or something
                    <div key={user._id}>
                        <div><Avatar
                            dataState='done'
                            imgSrc={user.pictureUrl ? user.pictureUrl : personIcon}
                            size='xs'
                            name={
                                {
                                    first:user.firstName as string,
                                    last:user.lastName as string,
                                }
                            }
                            status='online'
                            backgroundColor='lightblue'
                        /> {user.firstName} {user.lastName}</div>
                        <Button onClick={()=>{
                            startCall(user._id).then(call => {
                            //overwrites the default message
                            this.setupCallUI(call as any);
                        })}}>Start Call</Button>
                    </div>
                )
            })
            this.setState({
                availableUsers:divs
            })
        }
    }

    async getUnanweredCallInfo() {
        let keys = Object.keys(this.state.unansweredCalls);

        let divs = [] as any;

        console.log('getUnanweredCallInfo') //this should throw on the subscription event for receiveCallInformation

        for(const key of keys) {

            if(!this.listed[key])
                this.listed[key] = true;
            else continue;
                        
            let call = this.state.unansweredCalls[key] as RTCCallProps;
     
            this.setupCallUI(call);

            let divId = `call${call._id}`;

            divs.push(
                <div id={divId} key={divId}>
                    <div>User: {call.firstName} {call.lastName}</div>
                    <Button onClick={() => {answerCall(call as any);}}>Join Call</Button>
                </div>
            );
        };

        let unanswered = this.state.unansweredCallDivs;
        unanswered?.push(...divs);

        this.setState({unansweredCallDivs:unanswered});
        this.render();
        
    }

    setupCallUI(call:RTCCallInfo|RTCCallProps) {
         //overwrites the default message
         call.ondatachannel = (ev) => {
            console.log('Call started with', call.firstName, call.lastName);

            webrtc.rtc[call._id as string].run('ping').then((res) => {
                console.log('ping result should be pong. Result:', res);//test to validate connection, should ping the other's console.
            });

            //the call is now live, add tracks
            //data channel streams the device data
            enableDeviceStream(call._id); //enable my device to stream data to this endpoint
            
            ev.channel.onmessage = (ev) => { 
                if(ev.data.message) {

                    if(!call.messages) call.messages = [] as any;
                    call.messages.push({message:ev.data.message, timestamp:Date.now(), from:call.firstName + ' ' + call.lastName});

                    this.messages.push(<div>
                        {call.firstName} {call.lastName}: {ev.data.message} | {new Date().toLocaleTimeString()}
                    </div>);
                    (document.getElementById(this.unique + 'messages') as HTMLElement).insertAdjacentHTML('beforeend',`<div>
                        ${call.firstName} ${call.lastName}: ${ev.data.message} | ${new Date().toLocaleTimeString()}
                    </div>`);
                }
                if(ev.data.emg) {
                    if(!state.data[call._id+'detectedEMG']) state.setState({[call._id+'detectedEMG']:true});
                    state.setValue(call._id+'emg', ev.data.emg);
                } 
                if (ev.data.ppg) {
                    if(!state.data[call._id+'detectedPPG']) state.setState({[call._id+'detectedPPG']:true});
                    state.setValue(call._id+'ppg', ev.data.ppg);
                } 
                if (ev.data.hr) {
                    state.setValue(call._id+'hr', ev.data.hr);
                } 
                if (ev.data.hrv) {
                    state.setValue(call._id+'hrv', ev.data.hrv);
                } 
                if (ev.data.breath) {
                    state.setValue(call._id+'breath', ev.data.breath);
                } 
                if (ev.data.brv) {
                    state.setValue(call._id+'brv', ev.data.brv);
                } 
                if (ev.data.imu) {
                    if(!state.data[call._id+'detectedIMU']) state.setState({[call._id+'detectedIMU']:true});
                    state.setValue(call._id+'imu', ev.data.imu);
                } 
                if (ev.data.env) {
                    if(!state.data[call._id+'detectedENV']) state.setState({[call._id+'detectedENV']:true});
                    state.setValue(call._id+'env', ev.data.env);
                } //else if (ev.data.emg2) {}
            }

            //now add a device chart component
            if(this.state.activeStream === call._id) this.setState({
                chartDataDiv:createStreamChart(call)
            });
        } 

        call.ontrack = (ev) => {
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
        }

        call.removetrack = (ev) => {
            if(this.state.activeStream === call._id) {
                if(ev.track.kind == 'audio') {
                    this.removeStreamAudio();
                } 
                if(ev.track.kind == 'video') {
                    this.removeStreamVideo();
                }
            }
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

    render = () => {

        let hasAudio;
        let hasVideo;
        let stream: RTCCallInfo|undefined = undefined;

        if(this.state.activeStream) {
            stream = this.state.availableStreams[this.state.activeStream] as RTCCallInfo;
            
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
            <div className="div">
                <h1>WebRTC Communication</h1>

                <h2>Received Calls</h2>
                <div id='receivedCalls'>
                    { this.state.unansweredCallDivs && this.state.unansweredCallDivs.map((div) => div ? div : "" ) }
                </div>
                <hr/>

                <h2>Available Users</h2>
                <div id='availableUsers'>
                    { this.state.availableUsers && this.state.availableUsers.map((div) => div ? div : "" ) }
                </div>
                <hr/>

                <h2>Select Stream</h2>

                    <StreamSelect onChange={()=>{ if(this.state.activeStream) this.setActiveStream(this.state.availableStreams[this.state.activeStream] as any) }} />
                
                <label>Streams:</label>
                <div id={this.unique + 'webrtcstream'}>{
                    this.state.activeStream ? (
                    <div>
                        {hasVideo ? <Button onClick={() => {
                            disableVideo(this.state.availableStreams[this.state.activeStream as any] as any);
                            this.render();
                        }}>Disable My Video</Button> : <Button onClick={() => {
                            enableVideo(this.state.availableStreams[this.state.activeStream as any] as any);
                            this.render();
                        }}>Enable My Video</Button>}
                        {hasAudio ? <Button onClick={() => {
                            disableAudio(this.state.availableStreams[this.state.activeStream as any] as any);
                            this.render();
                        }}>Disable My Audio</Button> : <Button onClick={() => {
                            enableAudio(this.state.availableStreams[this.state.activeStream as any] as any);
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
                    ) : ""
                }
                    
                </div>
            </div>
        )
    }

}


