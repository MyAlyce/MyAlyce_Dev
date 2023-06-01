import React from 'react';
import { sComponent } from '../state.component';


import { client, graph, usersocket, state, webrtc } from "../../scripts/client";


import {AuthorizationStruct, ProfileStruct} from 'graphscript-services/struct/datastructures/types'

import { RTCCallProps, RTCCallInfo, answerCall, startCall } from "../../scripts/webrtc";

import { Avatar } from "../lib/src";
import Button from 'react-bootstrap/Button';


import { WebRTCStream } from '../modules/WebRTCStream';

let personIcon = './assets/person.jpg';



export class WebRTCComponent extends sComponent {

    state = {
        availableUsers:undefined as undefined|any[],
        availableStreams:webrtc.rtc, //we can handle multiple connections too
        unansweredCalls:webrtc.unanswered, //webrtc.unanswered reference
        unansweredCallDivs:[] as any[],
        chartDataDiv:undefined,
        videoTrackDiv:undefined,
        audioTrackDiv:undefined,
        audioInDevices:[] as any[],
        audioOutDevices:[] as any[],
        cameraDevices:[] as any[],
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    activeStream?:string;
    listed = {};
    subscriptions = {} as any;
    evSub; streamSelectSub;
    messages = [] as any;

    constructor(props:{streamId?:string}) {
        super(props);
        this.listMediaDevices();
    }

    componentDidMount = () => {
        this.getUsers();
        this.getUnanweredCallInfo();
        this.evSub = graph.subscribe('receiveCallInformation',()=>{
            this.getUnanweredCallInfo();
        });
        this.streamSelectSub = state.subscribeEvent('activeStream',(id?)=>{
            if(id) {
                this.activeStream = id;
                this.setState({});
            }
        });
    }

    componentWillUnmount = () => {
        graph.unsubscribe('receiveCallInformation', this.evSub);
    }

    listMediaDevices() {
        navigator.mediaDevices.enumerateDevices()
        .then((deviceInfos) => { //https://github.com/garrettmflynn/intensities/blob/main/app/index.js

            let ain = [] as any[]; let aout = [] as any[]; let cam = [] as any[];
            for (var i = 0; i !== deviceInfos.length; ++i) {
                var deviceInfo = deviceInfos[i];
                var option = (<option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>{deviceInfo.label}</option>)//document.createElement('option');
                //option.value = deviceInfo.deviceId;
                //console.log(deviceInfo.kind, deviceInfo.deviceId);
                if (deviceInfo.kind === 'videoinput') {
                    if(!this.state.selectedVideo)
                        this.state.selectedVideo = deviceInfo.deviceId;
                    cam.push(option);
                    // option.text = deviceInfo.label || 'Camera ' +
                    //     (videoSelect.options.length + 1);
                    // this.camsrc.insertAdjacentElement('beforeend',option);
                }
                else if (deviceInfo.kind === 'audioinput') {
                    if(!this.state.selectedAudioIn)
                        this.state.selectedAudioIn = deviceInfo.deviceId;
                    ain.push(option);
                    // option.text = deviceInfo.label ||
                    //     'Microphone ' + (audioInputSelect.options.length + 1);
                    // this.camsrc.insertAdjacentElement('beforeend',option);
                } 
                else if (deviceInfo.kind === 'audiooutput') {
                    if(!this.state.selectedAudioOut)
                        this.state.selectedAudioOut = deviceInfo.deviceId;
                    aout.push(option);
                    // option.text = deviceInfo.label || 'Speaker ' +
                    //     (audioOutputSelect.options.length + 1);
                    //     this.camsrc.insertAdjacentElement('beforeend',option);
                } 
            }

            this.setState({
                audioInDevices:ain,
                audioOutDevices:aout,
                cameraDevices:cam
            })
        });
    }

    screenShare(call:RTCCallInfo) {
        //call.rtc.addTrack(new MediaStreamTrack(MediaStream)) //or something like that
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

        let userIds = await usersocket.run('getAllOnlineUsers', [pushed]);

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

        //console.log('getUnanweredCallInfo') //this should throw on the subscription event for receiveCallInformation

        for(const key of keys) {

            if(!this.listed[key])
                this.listed[key] = true;
            else continue;
                        
            let call = this.state.unansweredCalls[key] as RTCCallProps;
     
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

        //this.setState({});
        
    }

    sendMessage(call:RTCCallInfo) {
        let message = (document.getElementById(this.unique+'sendmessage') as HTMLInputElement).value;
        
        call.send({message:message});
        
        if(!call.messages) call.messages = [] as any;
        
        call.messages.push({message:message, timestamp:Date.now(), from:client.currentUser.firstName + ' ' + client.currentUser.lastName});
        
        this.messages.push(<div key={call.messages.length}>
            {client.currentUser.firstName} {client.currentUser.lastName}: {message} | {new Date().toLocaleTimeString()}
        </div>);
        
        (document.getElementById(this.unique + 'messages') as HTMLElement).insertAdjacentHTML('beforeend',`<div>
            ${client.currentUser.firstName} ${client.currentUser.lastName}: ${message} | ${new Date().toLocaleTimeString()}
        </div>`);
    }


    render = () => {

        return (
            <div className='container-fluid'>
                <h1>WebRTC Communication</h1>

                <h2>Received Calls</h2>
                <div id='receivedCalls'>
                    { this.state.unansweredCallDivs && this.state.unansweredCallDivs.map((div) => div ? div : "" ) }
                </div>
                <hr/>

                {/**
                 * TODO: 
                 *  Separate calling yourself from calling other users into a different menu
                 *  Maybe integrate lookup & calling permissions closer with the UserAuths content
                 */}
                <h2>Available Users</h2>
                <div id='availableUsers'>
                    { this.state.availableUsers && this.state.availableUsers.map((div) => div ? div : "" ) }
                </div>
                <hr/>
                {/* 
                    TODO: 
                        Also add a loop to check for new devices (e.g. 1 check per 1-3 seconds for new listings from enumerateDevices).
                        Add screenshare options
                    */
                }
                { this.state.audioInDevices?.length > 0 && (<div>Mic In:<select id={this.unique+'aIn'} onChange={(ev) => this.setState({selectedAudioIn: ev.target.value})}>{this.state.audioInDevices}</select>
                </div>)}
                { this.state.audioOutDevices?.length > 0 && (<div>Audio Out:<select id={this.unique+'aOut'} onChange={(ev) => this.setState({selectedAudioOut: ev.target.value})}>{this.state.audioOutDevices}</select> 
                </div>)}
                { this.state.cameraDevices?.length > 0 && (<div>Camera In:<select id={this.unique+'vIn'} onChange={(ev) => this.setState({selectedVideo: ev.target.value})}>{this.state.cameraDevices}</select>
                </div>)}
                {/* 
                <h2>Select Stream</h2>
                    <StreamSelect onChange={(ev)=>{ this.activeStream = ev.target.value; this.setState({}); }} />
                <label>Streams:</label>
                <div id={this.unique + 'webrtcstream'}>{
                    this.activeStream ? ( <WebRTCStream streamId={this.activeStream}/>
                    ) : ""
                } 
                </div>*/}

                <div className="grid">
                    {Object.keys(this.state.availableStreams).map((streamId: string) => <WebRTCStream streamId={streamId} audioInId={this.state.selectedAudioIn} videoInId={this.state.selectedVideo} audioOutId={this.state.selectedAudioOut}/>)}
                </div>
                    
            </div>
        )
    }

}


