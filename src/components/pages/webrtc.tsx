import { client, webrtc, graph, usersocket } from "../../scripts/client";
import { state, WebRTCInfo, WebRTCProps } from 'graphscript'//"../../../graphscript/index";//

import {AuthorizationStruct, ProfileStruct} from 'graphscript-services/struct/datastructures/types'
import React from 'react'
import { sComponent } from '../state.component';


import { answerCall, startCall  } from "../../scripts/webrtc";
import { Chart } from "../Chart";
import { StreamSelect } from "../StreamSelect";
import { Avatar, Button } from "../lib/src";

let personIcon = './assets/person.jpg';

export class WebRTCComponent extends sComponent {

    state = {
        loggedInId:undefined,
        availableUsers:undefined as undefined|any[],
        webrtcStream:undefined,
        availableStreams:webrtc.rtc, //we can handle multiple connections too
        unansweredCalls:webrtc.unanswered, //webrtc.unanswered reference
        unansweredCallDivs:[] as any[],
        chartDataDiv:undefined,
        videoTrackDiv:undefined,
        activeStream:undefined //stream/user in focus
    }

    listed = {};
    subscriptions = {} as any;
    evSub;

    constructor(props:{streamId?:string}) {
        super(props);
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
                        <div>User: <Avatar
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
                        <Button onClick={()=>{startCall(user._id).then(call => {
                            //overwrites the default message
                            call.ondatachannel = (ev) => {
                                console.log('call started with', user.firstName, user.lastName);
                                //the call is now live, add tracks
                                //data channel streams the device data
                                ev.channel.onmessage = (ev) => { 
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
                        
            let call = this.state.unansweredCalls[key] as WebRTCProps & {caller:string, firstName:string, lastName:string, socketId:string};
             
            call.onicecandidate = (ev) => {
                if(ev.candidate) { //we need to pass our candidates to the other endpoint, then they need to accept the call and return their ice candidates
                    let cid = `peercandidate${Math.floor(Math.random()*1000000000000000)}`;
                    usersocket.run(
                        'runConnection', //run this function on the backend router
                        [
                            call.caller, //run this connection 
                            'runAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
                            [ //and pass these arguments
                                'receiveCallInformation', //run this function on the user's end
                                {
                                    _id:call._id, 
                                    peercandidates:{[cid]:ev.candidate}
                                }
                            ],
                            call.socketId
                        ]
                    ).then((id) => {
                        console.log('call information echoed from peer:', id);
                    });
                }
            }

            //overwrites the default message
            call.ondatachannel = (ev) => {
                console.log('call started with', call.firstName, call.lastName);
                //the call is now live, add tracks
                //data channel streams the device data
                ev.channel.onmessage = (ev) => { 
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

    enableVideo(audio?:boolean) {
        //todo
    }

    enableDeviceStream(streamId) { //enable sending data to a given RTC channel
        if(state.data.device) {
            let stream = (this.state.availableStreams)[streamId as string] as WebRTCInfo;
            this.subscriptions[streamId] = {
                emg:state.subscribeEvent('emg', (data) => {
                    stream.send({ 'emg':data });
                }),
                ppg:state.subscribeEvent('ppg', (ppg) => {
                    stream.send({ 'ppg':ppg });
                }),
                hr:state.subscribeEvent('hr', (hr) => {
                    stream.send({
                        'hr': hr.bpm,
                        'hrv': hr.change
                    });
                }),
                breath:state.subscribeEvent('breath', (breath) => {
                    stream.send({
                        'breath':breath.bpm,
                        'brv':breath.change
                    });
                }),
                imu:state.subscribeEvent('imu', (imu) => {
                    stream.send({'imu':imu});
                }),
                env:state.subscribeEvent('env', (env) => {
                    stream.send({'env':env});
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
                    <StreamSelect/>
                    Stream:
                <div id='webrtcstream'>
                    {  this.state.videoTrackDiv ? this.state.videoTrackDiv : ""  }
                    {  this.state.chartDataDiv ? this.state.chartDataDiv : ""    }
                </div>
            </div>
        )
    }

}


