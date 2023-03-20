import { client, webrtc, graph, usersocket } from "../scripts/client";
import {ProfileStruct} from 'graphscript-services/struct/datastructures/types'
import React from 'react'
import { sComponent } from './state.component';
import { WebRTCInfo } from "graphscript";

export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined as undefined|any[],
        webrtcStream:undefined,
        availableStreams:{}, //we can handle multiple connections too
        unansweredCalls:{}, //webrtc.unanswered reference
        unansweredCallDivs:undefined as undefined|any[],
    }

    constructor(props:any) {
        super(props);
        this.getUsers();
        this.getUnanweredCallInfo();
    }

    async getUsers() {
        //todo: use user list supplied by authorizations rather than global server visibility (but this is just a test)
        let userIds = await usersocket.run('getAllOnlineUsers');
        let userInfo = await client.getUsers(userIds);
        if(userInfo) {
            let divs = [] as any[];
            userInfo.forEach((user:Partial<ProfileStruct>) => {

                let voicecall = async() => {
                    if(this.state.availableStreams[user._id as string]) {
                        //add track
                    } else {
                        //send handshake
                    }
                }
                let videocall = async() => {
                    if(this.state.availableStreams[user._id as string]) {
                        //add track
                    } else {
                        //send handshake
                    }
                }
                let view = async () => {

                    if(this.state.availableStreams[user._id as string]) {
                        //add track
                    } else {
                    
                    }
                }

                divs.push( //turn into a dropdown or something
                    <div>
                        <div>User: {user.firstName} {user.lastName}</div>
                        <button id={`voicecall${user._id}`} onClick={voicecall}>📞</button>
                        <button id={`videocall${user._id}`} onClick={videocall}>📽️</button>
                        <button id={`view${user._id}`} onClick={view}>💓</button> 
                    </div>
                )
            })
            this.setState({
                availableUsers:divs
            })
        }
    }

    async getUnanweredCallInfo() {
        let divs = Object.keys(this.state.unansweredCalls).map(async (key) => {
                        
            let call = this.state.unansweredCalls[key];
            let caller = (await client.getUsers([call.caller]))[0]

            let divId = `call${call._id}`;

            let answerCall = () => {
                webrtc.answerCall(call);
                document.getElementById(divId)?.remove();
            }

            return (
                <div id={divId}>
                    <div>User: {caller.firstName} {caller.lastName}</div>
                    <button onClick={answerCall}>Join Call</button>
                </div>
            );
        });

        this.setState({unansweredCallDivs:divs});
    }

    render() {
        return (
            <div>
                <div id='receivedCalls'>
                    { this.state.unansweredCallDivs && this.state.unansweredCallDivs.map((div) => div ) }
                </div>
                <div id='availableUsers'>
                    { this.state.availableUsers && this.state.availableUsers.map((div) => div ) }
                </div>
                <div id='webrtcstream'>
                    {  this.state.webrtcStream  }
                </div>
            </div>
        )
    }

}


