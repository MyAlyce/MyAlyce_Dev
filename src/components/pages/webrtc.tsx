import React, {Component} from 'react';
import { sComponent } from '../state.component';


import { client, webrtc, graph, usersocket, state } from "../../scripts/client";

import {WebRTCInfo, WebRTCProps } from 'graphscript'// "../../../../graphscript/index";//

import {AuthorizationStruct, ProfileStruct} from 'graphscript-services/struct/datastructures/types'

import { RTCCallProps, RTCCallInfo, answerCall, startCall } from "../../scripts/webrtc";

import { StreamSelect } from "../modules/StreamSelect";

import { Avatar, Button } from "../lib/src";


import { WebRTCStream } from '../modules/WebRTCStream';

let personIcon = './assets/person.jpg';



export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined as undefined|any[],
        availableStreams:webrtc.rtc, //we can handle multiple connections too
        unansweredCalls:webrtc.unanswered, //webrtc.unanswered reference
        unansweredCallDivs:[] as any[],
        chartDataDiv:undefined,
        videoTrackDiv:undefined,
        audioTrackDiv:undefined
    }

    activeStream?:string;
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

        //this.render();
        
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


    render = () => {

        let hasAudio;
        let hasVideo;
        let stream: RTCCallInfo|undefined = undefined;

        if(this.activeStream) {
            stream = this.state.availableStreams[this.activeStream] as RTCCallInfo;
            
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
                    <StreamSelect onChange={(ev)=>{ this.activeStream = ev.target.value; this.setState({}); }} />
                <label>Streams:</label>
                <div id={this.unique + 'webrtcstream'}>{
                    this.activeStream ? ( <WebRTCStream streamId={this.activeStream}/>
                    ) : ""
                }
                    
                </div>
            </div>
        )
    }

}


