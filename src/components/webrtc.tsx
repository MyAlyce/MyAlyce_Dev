import { client, webrtc, graph, usersocket } from "../scripts/client";
import {ProfileStruct} from 'graphscript-services/struct/datastructures/types'
import React from 'react'
import { sComponent } from './state.component';
import { state, WebRTCInfo, WebRTCProps } from "graphscript";
import { Device } from "./Device";
import { answerCall } from "../scripts/webrtc";

export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined as undefined|any[],
        webrtcStream:undefined,
        availableStreams:{}, //we can handle multiple connections too
        unansweredCalls:webrtc.unanswered, //webrtc.unanswered reference
        unansweredCallDivs:undefined as undefined|any[],
        chartDataDiv:undefined,
        videoTrackDiv:undefined
    }

    subscriptions = {} as any;
    deviceId?:string

    constructor(props:{deviceId?:string}) {
        super(props);
        if(props.deviceId) this.deviceId = props.deviceId;
    }

    componentDidMount() {
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
                    <div key={user._id}>
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
                        
            let call = this.state.unansweredCalls[key] as WebRTCProps;
            let caller = (await client.getUsers([(call as any).caller]))[0];
            
            call.onicecandidate = (ev) => {
                if(ev.candidate) { //we need to pass our candidates to the other endpoint, then they need to accept the call and return their ice candidates
                    let cid = `peercandidate${Math.floor(Math.random()*1000000000000000)}`;
                    usersocket.run(
                        'runConnection', //run this function on the backend router
                        [
                            (call as any).caller, //run this connection 
                            'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                            'receiveCallInformation', //run this function on the user's end
                            [ //and pass these arguments
                                {
                                    _id:call._id, 
                                    peercandidates:{[cid]:ev.candidate}
                                }
                            ]
                        ]
                    ).then((id) => {
                        console.log('call information echoed from peer:', id);
                    });
                }
            }

            //overwrites the default message
            call.ondatachannel = (ev) => {
                //the call is now live, add tracks
                //data channel streams the device data
                ev.channel.onmessage = (ev) => { 
                    if(ev.data.emg) {
                        state.setValue(this.deviceId ? this.deviceId+'emg' : 'emg', ev.data.emg);
                    } 
                    if (ev.data.ppg) {
                        state.setValue(this.deviceId ? this.deviceId+'ppg' : 'ppg', ev.data.ppg);
                    } 
                    if (ev.data.hr) {
                        state.setValue(this.deviceId ? this.deviceId+'hr' : 'hr', ev.data.hr);
                    } 
                    if (ev.data.hrv) {
                        state.setValue(this.deviceId ? this.deviceId+'hrv' : 'hrv', ev.data.hrv);
                    } 
                    if (ev.data.breath) {
                        state.setValue(this.deviceId ? this.deviceId+'breath' : 'breath', ev.data.breath);
                    } 
                    if (ev.data.brv) {
                        state.setValue(this.deviceId ? this.deviceId+'brv' : 'brv', ev.data.brv);
                    } 
                    if (ev.data.imu) {
                        state.setValue(this.deviceId ? this.deviceId+'imu' : 'imu', ev.data.imu);
                    } 
                    if (ev.data.env) {
                        state.setValue(this.deviceId ? this.deviceId+'env' : 'env', ev.data.env);
                    } //else if (ev.data.emg2) {}
                }

                //now add a device chart component
                this.setState({
                    chartDataDiv:(
                        <div>
                            <Device
                              remote={true}
                              deviceId={call._id}
                            />
                        </div>
                    )
                });
            } 

            call.ontrack = (ev) => {
                //received a media track, e.g. audio or video
                //video/audio channel, if video add a video tag, if audio make the audio context
                
                //if video, else if audio, else if video & audio
                this.setState({
                    videoTrackDiv:(
                        <div>
                            <video></video>
                        </div>
                    )
                });
            }

            let divId = `call${call._id}`;

            return (
                <div id={divId} key={divId}>
                    <div>User: {caller.firstName} {caller.lastName}</div>
                    <button onClick={() => {answerCall(call as any);}}>Join Call</button>
                </div>
            );
        });

        this.setState({unansweredCallDivs:divs});
    }

    enableVideo(audio?:boolean) {
        //todo
    }

    enableDeviceStream(streamId) { //enable sending data to a given RTC channel
        if(state.data.device) {
            let stream = (this.state.availableStreams)[streamId as string] as WebRTCInfo;
            this.subscriptions[streamId] = {
                emg:state.subscribeEvent('emg', (data) => {
                    stream.send({ [streamId+'emg']:data });
                }),
                ppg:state.subscribeEvent('ppg', (ppg) => {
                    stream.send({ [streamId+'ppg']:ppg });
                }),
                hr:state.subscribeEvent('hr', (hr) => {
                    stream.send({
                        [streamId+'hr']: hr.bpm,
                        [streamId+'hrv']: hr.change
                    });
                }),
                breath:state.subscribeEvent('breath', (breath) => {
                    stream.send({
                        [streamId+'breath']:breath.bpm,
                        [streamId+'brv']:breath.change
                    });
                }),
                imu:state.subscribeEvent('imu', (imu) => {
                    stream.send({[streamId+'imu']:imu});
                }),
                env:state.subscribeEvent('env', (env) => {
                    stream.send({[streamId+'env']:env});
                })
            };

            stream.onclose = () => {
                for(const key in this.subscriptions[streamId]) {
                    state.unsubscribeEvent(key, this.subscriptions[streamId][key]);
                }
            }
        }
    }

    render() {
        return (
            <div>
                <div id='receivedCalls'>
                    Received Calls
                    { this.state.unansweredCallDivs && this.state.unansweredCallDivs.map((div) => div ) }
                </div>
                <hr/>
                <div id='availableUsers'>
                    Available Users
                    { this.state.availableUsers && this.state.availableUsers.map((div) => div ) }
                </div>
                <hr/>
                    Stream:
                <div id='webrtcstream'>
                    {  this.state.videoTrackDiv  }
                    {  this.state.chartDataDiv  }
                </div>
            </div>
        )
    }

}


