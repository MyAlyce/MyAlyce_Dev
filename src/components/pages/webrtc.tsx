import React from 'react';
import { sComponent } from '../state.component';


import { client, graph, DataServerSocket, state, webrtc } from "../../scripts/client";


import {AuthorizationStruct, ProfileStruct} from 'graphscript-services/struct/datastructures/types'

import { RTCCallInfo } from "../../scripts/webrtc";

import { Avatar } from "../lib_old/src";

import { WebRTCStream } from '../modules/WebRTC/WebRTCStream';
import { MediaDeviceOptions, StartCall, UnanweredCallInfo } from '../modules/WebRTC/Calling';

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

        let userIds = await DataServerSocket.info.run('getAllOnlineUsers', [pushed]);

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
                        {StartCall({userId:user._id})}
                    </div>
                )
            })
            this.setState({
                availableUsers:divs
            })
        }
    }

    async getUnanweredCallInfo() {
        let divs = UnanweredCallInfo();
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

        return "UNDER CONSTRUCTION";

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
                    { this.state.availableUsers && this.state.availableUsers?.map((div) => div ? div : "" ) }
                </div>
                <hr/>
                {/* 
                    TODO: 
                        Also add a loop to check for new devices (e.g. 1 check per 1-3 seconds for new listings from enumerateDevices).
                        Add screenshare options
                    */
                }
                <MediaDeviceOptions/>
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
                    {Object.keys(this.state.availableStreams).map((streamId: string) => 
                        <WebRTCStream 
                            streamId={streamId} 
                            audioInId={this.state.selectedAudioIn} 
                            videoInId={this.state.selectedVideo} 
                            audioOutId={this.state.selectedAudioOut}
                        />
                    )}
                </div>
                    
            </div>
        )
    }

}


