import { client, webrtc, graph, usersocket } from "../scripts/client";
import { state, WebRTCInfo, WebRTCProps } from 'graphscript'//"../../../graphscript/index";//

import {ProfileStruct} from 'graphscript-services/struct/datastructures/types'
import React from 'react'
import { sComponent } from './state.component';


import { answerCall, startCall  } from "../scripts/webrtc";
import { Chart } from "./Chart";

export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined as undefined|any[],
        webrtcStream:undefined,
        availableStreams:webrtc.rtc, //we can handle multiple connections too
        unansweredCalls:webrtc.unanswered, //webrtc.unanswered reference
        unansweredCallDivs:[] as any[],
        chartDataDiv:undefined,
        videoTrackDiv:undefined
    }

    listed = {};
    subscriptions = {} as any;
    deviceId?:string
    evSub;

    constructor(props:{deviceId?:string}) {
        super(props);
        if(props.deviceId) this.deviceId = props.deviceId;
    }

    componentDidMount = () => {
        this.getUsers();
        this.getUnanweredCallInfo();
        this.evSub = state.subscribeEvent('receiveCallInformation',()=>{
            this.getUnanweredCallInfo();
        });
    }

    componentWillUnmount = () => {
        state.unsubscribeEvent('receiveCallInformation', this.evSub);
    }

    async getUsers() {
        //todo: use user list supplied by authorizations rather than global server visibility (but this is just a test)
        let userIds = await usersocket.run('getAllOnlineUsers');
        let userInfo = await client.getUsers(userIds);
        if(userInfo) {
            let divs = [] as any[];
            userInfo.forEach((user:Partial<ProfileStruct>) => {
                //console.log(user);
                divs.push( //turn into a dropdown or something
                    <div key={user._id}>
                        <div>User: {user.firstName} {user.lastName}</div>
                        <button id={`startcall${user._id}`} onClick={()=>{startCall(user._id)}}>Start Call</button>
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

        console.log('getUnanweredCallInfo')

        for(const key of keys) {

            if(!this.listed[key])
                this.listed[key] = true;
            else continue;
                        
            let call = this.state.unansweredCalls[key] as WebRTCProps;
            let caller = (await client.getUsers([(call as any).caller]))[0];
            
            call.onicecandidate = (ev) => {
                if(ev.candidate) { //we need to pass our candidates to the other endpoint, then they need to accept the call and return their ice candidates
                    let cid = `peercandidate${Math.floor(Math.random()*1000000000000000)}`;
                    usersocket.run(
                        'runConnection', //run this function on the backend router
                        [
                            (call as any).caller, //run this connection 
                            'runAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
                            [ //and pass these arguments
                                'receiveCallInformation', //run this function on the user's end
                                {
                                    _id:call._id, 
                                    peercandidates:{[cid]:ev.candidate}
                                }
                            ],
                            (call as any).socketId
                        ]
                    ).then((id) => {
                        console.log('call information echoed from peer:', id);
                    });
                }
            }

            //overwrites the default message
            call.ondatachannel = (ev) => {
                console.log('call started')
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
                            <Chart
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

            divs.push(
                <div id={divId} key={divId}>
                    <div>User: {caller.firstName} {caller.lastName}</div>
                    <button onClick={() => {answerCall(call as any);}}>Join Call</button>
                </div>
            );
        };

        let unanswered = this.state.unansweredCallDivs;
        unanswered?.push(...divs);

        this.setState({unansweredCallDivs:unanswered});
        this.render();
        
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
                    { this.state.unansweredCallDivs && this.state.unansweredCallDivs.map((div) => div ? div : "" ) }
                </div>
                <hr/>
                <div id='availableUsers'>
                    Available Users
                    { this.state.availableUsers && this.state.availableUsers.map((div) => div ? div : "" ) }
                </div>
                <hr/>
                    Stream:
                <div id='webrtcstream'>
                    {  this.state.videoTrackDiv ? this.state.videoTrackDiv : ""  }
                    {  this.state.chartDataDiv ? this.state.chartDataDiv : ""    }
                </div>
            </div>
        )
    }

}


