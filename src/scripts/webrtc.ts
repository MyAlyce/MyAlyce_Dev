import { setupAlerts } from "./alerts";
import { client, graph, usersocket, webrtc, state } from "./client"

import {WebRTCInfo, WebRTCProps} from 'graphscript'//'../../../graphscript/index'//
import { csvworkers } from "./datacsv";
import gsworker from './device.worker'
import { workers } from "device-decoder";
//https://hacks.mozilla.org/2013/07/webrtc-and-the-ocean-of-acronyms/


const webrtcData = {
    webrtcStream:undefined, //current active stream
    availableStreams:webrtc.rtc as {[key:string]:WebRTCInfo}, //list of accepted calls
    unansweredCalls:webrtc.unanswered as {[key:string]:WebRTCProps & {caller:string, firstName?:string, lastName?: string}}
}

state.setState(webrtcData);


export type RTCCallProps = WebRTCProps & {
    caller:string, 
    firstName:string, 
    lastName:string, 
    pictureUrl:string, 
    socketId:string, 
    messages:{message:string, from:string, timestamp:number}[], 
    events:{message:string, from:string, timestamp:number}[], 
    alerts:{message:string, from:string, timestamp:number}[], 
    videoSender?:RTCRtpSender, 
    audioSender?:RTCRtpSender
}

export type RTCCallInfo = WebRTCInfo & {
    caller:string, 
    firstName:string, 
    lastName:string,
    pictureUrl:string, 
    socketId:string,  
    messages:{message:string, from:string, timestamp:number}[],
    events:{message:string, from:string, timestamp:number}[], 
    alerts:{message:string, from:string, timestamp:number}[], 
    videoSender?:RTCRtpSender, 
    audioSender?:RTCRtpSender
}


//spaghetti

//started from host end, see answerCall for peer end
export async function startCall(userId) {
    //send handshake
    let rtcId = `room${Math.floor(Math.random()*1000000000000000)}`;
    
    let nodes = setupAlerts(rtcId);

    let rtc = await webrtc.openRTC({ 
        _id:rtcId,
        onicecandidate:async (ev) => {
            if(ev.candidate) { //we need to pass our candidates to the other endpoint, then they need to accept the call and return their ice candidates
                let cid = `candidate${Math.floor(Math.random()*1000000000000000)}`;
                usersocket.run(
                    'runConnection', //run this function on the backend router
                    [
                        userId, //run this connection 
                        'runAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
                        [ //and pass these arguments
                            'receiveCallInformation', //run this function on the user's end
                            {
                                _id:rtcId, 
                                candidates:{[cid]:ev.candidate}
                            }
                        ]
                    ]
                ).then((id) => {
                    console.log('call information echoed from peer:', id);
                });
            }
        },
        ondatachannel: (ev) => {
            console.log('Call started with', (rtc as RTCCallInfo).firstName, (rtc as RTCCallInfo).lastName);

            webrtc.rtc[rtc._id as string].run('ping').then((res) => {
                console.log('ping result should be pong. Result:', res);//test to validate connection, should ping the other's console.
            });

            //the call is now live, add tracks
            //data channel streams the device data
            enableDeviceStream(rtc._id); //enable my device to stream data to this endpoint
            
            ev.channel.onmessage = (ev) => { 
                if(ev.data.message) {

                    if(!(rtc as RTCCallInfo).messages) (rtc as RTCCallInfo).messages = [] as any;
                    (rtc as RTCCallInfo).messages.push({message:ev.data.message, timestamp:Date.now(), from:(rtc as RTCCallInfo).firstName + ' ' + (rtc as RTCCallInfo).lastName});

                }
                if(ev.data.emg) {
                    if(!state.data[rtc._id+'detectedEMG']) state.setState({[rtc._id+'detectedEMG']:true});
                    state.setValue(rtc._id+'emg', ev.data.emg);
                } 
                if (ev.data.ppg) {
                    if(!state.data[rtc._id+'detectedPPG']) state.setState({[rtc._id+'detectedPPG']:true});
                    state.setValue(rtc._id+'ppg', ev.data.ppg);
                } 
                if (ev.data.hr) {
                    state.setValue(rtc._id+'hr', ev.data.hr);
                } 
                if (ev.data.hrv) {
                    state.setValue(rtc._id+'hrv', ev.data.hrv);
                } 
                if (ev.data.breath) {
                    state.setValue(rtc._id+'breath', ev.data.breath);
                } 
                if (ev.data.brv) {
                    state.setValue(rtc._id+'brv', ev.data.brv);
                } 
                if (ev.data.imu) {
                    if(!state.data[rtc._id+'detectedIMU']) state.setState({[rtc._id+'detectedIMU']:true});
                    state.setValue(rtc._id+'imu', ev.data.imu);
                } 
                if (ev.data.env) {
                    if(!state.data[rtc._id+'detectedENV']) state.setState({[rtc._id+'detectedENV']:true});
                    state.setValue(rtc._id+'env', ev.data.env);
                } //else if (ev.data.emg2) {}
            }

        },
        ontrack:(ev) => {
            console.log('\n\n\nreceived track\n\n\n',ev);
        },
        onclose:() => {
            for(const key in nodes) {
                graph.remove(key,true);
            }
        }
        // ondatachannel:(ev) => {
        //     //the call is now live, set ev.channel.onmessage function and add media tracks etc.
        // },
        // ontrack:(ev) => {
        //     //received a media track, e.g. audio or video
        // }
    });

    rtc.onnegotiationneeded = async (ev, description) => {//both ends need to set this function up when adding audio and video tracks freshly
    
        console.log('negotiating');

        usersocket.run(
            'runConnection', //run this function on the backend router
            [
                (webrtc.rtc[rtc._id as string] as RTCCallInfo).caller, //run this connection 
                'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                [ //and pass these arguments
                    'negotiateCall', //run this function on the user's end
                    [rtc._id, encodeURIComponent(JSON.stringify(description))]
                ],
                (webrtc.rtc[rtc._id as string] as RTCCallInfo).socketId
            ]
        ).then((description) => {
            if(description) console.log('remote description returned');
            else console.log('caller renegotiated');
            
            if(description) webrtc.negotiateCall(rtc._id as string, description);
        });
    };

    usersocket.post(
        'runConnection', //run this function on the backend router
        [
            userId, //run this connection 
            'postAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
            [ //and pass these arguments
                'receiveCallInformation', //run this function on the user's end
                {
                    _id:rtcId, 
                    description:encodeURIComponent(JSON.stringify(rtc.rtc.localDescription)), //the peer needs to accept this
                    caller:client.currentUser._id,
                    socketId:usersocket._id,
                    firstName:client.currentUser.firstName,
                    lastName:client.currentUser.lastName,
                    pictureUrl:client.currentUser.pictureUrl
                }
            ]
        ]
    );

    return rtc;
}

export let answerCall = async (call:RTCCallProps) => {
    
    let nodes = setupAlerts(call._id);
    
    call.onclose = () => {
        for(const key in nodes) {
            graph.remove(key,true);
        }
    }
    
    //both ends need to set this function up when adding audio and video tracks freshly
    call.onnegotiationneeded = async (ev, description) => { 
        console.log('negotiating');
        usersocket.run(
            'runConnection', //run this function on the backend router
            [
                call.caller, //run this connection 
                'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                [ //and pass these arguments
                    'negotiateCall', //run this function on the user's end
                    [rtc._id, encodeURIComponent(JSON.stringify(description))]
                ],
                call.socketId
            ]
        ).then((description) => {
            if(description) console.log('remote description returned');
            else console.log('caller renegotiated');
            
            if(description) webrtc.negotiateCall(rtc._id as string, description);
        });
    };

    call.ondatachannel = (ev) => {
        console.log('Call started with', (call as RTCCallInfo).firstName, (call as RTCCallInfo).lastName);

        webrtc.rtc[call._id as string].run('ping').then((res) => {
            console.log('ping result should be pong. Result:', res);//test to validate connection, should ping the other's console.
        });

        //the call is now live, add tracks
        //data channel streams the device data
        enableDeviceStream(call._id); //enable my device to stream data to this endpoint

        const from = (call as RTCCallInfo).firstName + ' ' + (call as RTCCallInfo).lastName;

        ev.channel.onmessage = (ev) => { 

            if(ev.data.alert) {
                state.setValue(call._id+'alert',ev.data.alert);

                if(!(call as RTCCallInfo).events) (call as RTCCallInfo).events = [] as any;
                const message = {message:ev.data.event, timestamp:Date.now(), from:from};
                (call as RTCCallInfo).events.push(message);
                
                //if(state.data.isRecording) {
                    if(!csvworkers[call._id+'alerts']) {
                        csvworkers[call._id+'alerts'] =  workers.addWorker({ url: gsworker });
                        csvworkers[call._id+'alerts'].run('createCSV', [
                            `${call.firstName+call.lastName}/Alerts_${(call as RTCCallInfo).firstName + ' ' + (call as RTCCallInfo).lastName}.csv`,
                            [
                                'timestamp','from','message'
                            ]
                        ]);
                    }
                    csvworkers[call._id+'alerts'].run('appendCSV',message);
                //}

            }
            if(ev.data.event) {

                if(!(call as RTCCallInfo).events) (call as RTCCallInfo).events = [] as any;
                const message = {message:ev.data.event, timestamp:Date.now(), from:from};
                (call as RTCCallInfo).events.push(message);
                
                //if(state.data.isRecording) {
                    if(!csvworkers[call._id+'events']) {
                        csvworkers[call._id+'events'] =  workers.addWorker({ url: gsworker });
                        csvworkers[call._id+'events'].run('createCSV', [
                            `${call.firstName+call.lastName}/Events_${(call as RTCCallInfo).firstName + ' ' + (call as RTCCallInfo).lastName}.csv`,
                            [
                                'timestamp','from','message'
                            ]
                        ]);
                    }
                    csvworkers[call._id+'events'].run('appendCSV',message);
                //}
            }
            if(ev.data.message) {

                if(!(call as RTCCallInfo).messages) (call as RTCCallInfo).messages = [] as any;
                const message = {message:ev.data.message, timestamp:Date.now(), from:from};
                (call as RTCCallInfo).messages.push(message);
                
                if(state.data.isRecording) {
                    if(!csvworkers[call._id+'chat']) {
                        csvworkers[call._id+'chat'] =  workers.addWorker({ url: gsworker });
                        csvworkers[call._id+'chat'].run('createCSV', [
                            `${call.firstName+call.lastName}/Chat_${new Date().toISOString()}${(call as RTCCallInfo).firstName + ' ' + (call as RTCCallInfo).lastName}.csv`,
                            [
                                'timestamp','from','message'
                            ]
                        ]);
                    }
                    csvworkers[call._id+'chat'].run('appendCSV',message)
                }
                
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
    };

    let rtc = await webrtc.answerCall(call as any);

    usersocket.run(
        'runConnection', //run this function on the backend router
        [
            client.currentUser._id, //run this connection 
            'postAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
            [ //and pass these arguments
                'cleanupCallInfo', //run this function on the user's end
                call._id
            ]
        ]
    )
    
    usersocket.run(
        'runConnection', //run this function on the backend router
        [
            call.caller, //run this connection 
            'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
            [ //and pass these arguments
                'answerPeer', //run this function on the user's end
                [
                    rtc._id,
                    {
                        description:encodeURIComponent(JSON.stringify(rtc.rtc.localDescription)), //the host needs this
                        caller:client.currentUser._id,
                        socketId:usersocket._id,
                        firstName:client.currentUser.firstName,
                        lastName:client.currentUser.lastName,
                        pictureUrl:client.currentUser.pictureUrl
                    }
                ]
            ],
            call.socketId
        ]
    );

    state.setState({
        activeStream:call._id,
        availableStreams:webrtc.rtc
    });
}

graph.subscribe('receiveCallInformation', (id) => {
    
    console.log('received call information:', id);

    //console.log(graph.__node.state, state, graph.__node.state.data.receiveCallInformation, state.data.receiveCallInformation);
        
    let call = webrtc.unanswered[id] as WebRTCProps & {caller:string, firstName:string, lastName:string, socketId:string};
         
    if(call) {
        if(!call.onicecandidate) call.onicecandidate = (ev) => {
            if(ev.candidate) { //we need to pass our candidates to the other endpoint, then they need to accept the call and return their ice candidates
                let cid = `candidate${Math.floor(Math.random()*1000000000000000)}`;
                usersocket.run(
                    'runConnection', //run this function on the backend router
                    [
                        call.caller, //run this connection 
                        'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                        [ //and pass these arguments
                            'receiveCallInformation', //run this function on the user's end
                            {
                                _id:call._id, 
                                candidates:{[cid]:ev.candidate}
                            }
                        ],
                        call.socketId
                    ]
                ).then((id) => {
                    console.log('call information echoed from peer:', id);
                });
            }
        }
    
        state.setState({
            unansweredCalls:webrtc.unanswered
        }); //update this event for the app
    
    }
});


export function enableDeviceStream(streamId) { //enable sending data to a given RTC channel
    
    let stream = webrtc.rtc[streamId as string] as WebRTCInfo;
    if(stream) {
        let subscriptions = {};
        subscriptions[streamId] = {
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
                state.unsubscribeEvent(key, subscriptions[streamId][key]);
            }
        }     
    }
    
}


export function enableAudio(call:RTCCallInfo, audioOptions:boolean|MediaTrackConstraints=true) {

    if(call.audioSender) this.disableVideo(call);
    
    let senders = webrtc.addUserMedia(
        call.rtc, 
        {
            audio:audioOptions,
            video:false
        }, 
        call 
    );

    call.audioSender = senders[0];
    if((audioOptions as MediaTrackConstraints)?.deviceId) {
        senders[0].deviceId = (audioOptions as MediaTrackConstraints).deviceId;
    }
}

export function enableVideo(
    call:RTCCallInfo, 
    options:MediaTrackConstraints  = {
        //deviceId: 'abc' //or below default setting:
        optional:[
            {minWidth: 320},
            {minWidth: 640},
            {minWidth: 1024},
            {minWidth: 1280},
            {minWidth: 1920},
            {minWidth: 2560},
            {minWidth: 3840},
        ]
    } as MediaTrackConstraints  & { optional:{minWidth: number}[] },
    includeAudio:boolean=false
) { //the maximum available resolution will be selected if not specified
    
    if(call.videoSender) this.disableVideo(call);

    let senders = webrtc.addUserMedia(
        call.rtc, 
        {
            audio:includeAudio, 
            video:options
        }, 
        call 
    );

    call.videoSender = senders[0];
    if((options as MediaTrackConstraints)?.deviceId) {
        senders[0].deviceId = (options as MediaTrackConstraints).deviceId;
    }
}

export function disableAudio(call:RTCCallInfo) {
    if(call.audioSender) {
        call.rtc.removeTrack(call.audioSender);
        call.audioSender.track?.stop();
        call.audioSender = undefined;
    }
}

export function disableVideo(call:RTCCallInfo) {
    if(call.videoSender) {
        call.rtc.removeTrack(call.videoSender);
        call.videoSender.track?.stop();
        call.videoSender = undefined;
    }
}
