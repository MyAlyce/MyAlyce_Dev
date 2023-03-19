import { client, webrtc, graph, usersocket } from "../scripts/client";
import {ProfileStruct} from 'graphscript-services/struct/datastructures/types'
import React from 'react'
import { sComponent } from './state.component';
import { WebRTCInfo } from "graphscript";

export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined,
        webrtcStream:undefined,
        availableStreams:{}
    }

    async getUsers() {
        //todo: use user list supplied by authorizations rather than global server visibility (but this is just a test)
        let userIds = await usersocket.run('getAllOnlineUsers');
        let userInfo = await client.getUsers(userIds);
        if(userInfo) {
            let divs = [] as any[];
            userInfo.forEach((user:Partial<ProfileStruct>) => {
                
                async function openRTC() {
                    //send handshake
                    let rtcId = `room${Math.floor(Math.random()*1000000000000000)}`;
                    
                    //has the user accepted the call?
                    let userAccepted = new Promise((res,rej) => {
                        res(true);
                    });
                    
                    let rtc = await webrtc.openRTC({ 
                        _id:rtcId,
                        onicecandidate:async (ev) => {
                            if(ev.candidate) {
                                //let cid = `hostcandidate${Math.floor(Math.random()*1000000000000000)}`;
                                let ready = await userAccepted;
                                if(ready) usersocket.run('runConnection',[user._id, 'run', 'addIceCandidate', [rtcId, ev.candidate]]);
                            }
                        }
                    });

                    //usersocket.run('runConnection',[user._id, 'run', ''])
                }

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

                divs.push(
                    <div>
                        <div>User: {user.firstName} {user.lastName}</div>
                        <button id={`voicecall${user._id}`} onClick={voicecall}>📞</button>
                        <button id={`videocall${user._id}`} onClick={videocall}>📽️</button>
                        <button id={`view${user._id}`} onClick={view}>💓</button> 
                    </div>
                )
            })
        }
    }

    render() {
        return (
            <div>
                <div id='availableUsers'>
                    { this.state.availableUsers }
                </div>
                <div id='webrtcstream'>
                    {  this.state.webrtcStream  }
                </div>
            </div>
        )
    }

}
