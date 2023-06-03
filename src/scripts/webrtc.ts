
import { client, graph, usersocket, state, webrtc } from "./client"
import { recordChat, recordEvent } from "./datacsv";

import { onAlert, setupAlerts } from "./alerts";
import {WebRTCInfo, WebRTCProps} from 'graphscript'//'../../../graphscript/index'//
//https://hacks.mozilla.org/2013/07/webrtc-and-the-ocean-of-acronyms/



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
    alerts:{message:string, from:string, value:any, timestamp:number}[], 
    videoSender?:RTCRtpSender, 
    audioSender?:RTCRtpSender
}

export function getCallLocation(call:RTCCallInfo) {
    return call.run('getCurrentLocation'); //run geolocation at endpoint
}

export const onrtcdata = (call, from, data) => { 

    if(data.alert) {

        if(!(call as RTCCallInfo).events) (call as RTCCallInfo).alerts = [] as any;
        (call as RTCCallInfo).alerts.push(data.alert);

        onAlert(data.alert,call._id);

        state.setValue(call._id+'alert',data.alert);
    }
    if(data.event) {

        if(!(call as RTCCallInfo).events) (call as RTCCallInfo).events = [] as any;
        (call as RTCCallInfo).events.push(data.event);
        
        recordEvent(from, data.event, call._id);
    }
    if(data.message) {

        if(!(call as RTCCallInfo).messages) (call as RTCCallInfo).messages = [] as any;
        data.message.from = from;
        (call as RTCCallInfo).messages.push(data.message);
        
        if(state.data.isRecording) {
            recordChat(from, data.message, call._id);
        }
    }
    if(data.emg) {
        if(!state.data[call._id+'detectedEMG']) state.setState({[call._id+'detectedEMG']:true});
        state.setValue(call._id+'emg', data.emg);
    } 
    if(data.ecg) {
        if(!state.data[call._id+'detectedEMG']) state.setState({[call._id+'detectedEMG']:true});
        state.setValue(call._id+'ecg', data.ecg);
    } 
    if (data.ppg) {
        if(!state.data[call._id+'detectedPPG']) state.setState({[call._id+'detectedPPG']:true});
        state.setValue(call._id+'ppg', data.ppg);
    } 
    if (data.hr) {
        if(!state.data[call._id+'detectedPPG']) state.setState({[call._id+'detectedPPG']:true});
        state.setValue(call._id+'hr', data.hr);
    }  
    if (data.breath) {
        if(!state.data[call._id+'detectedPPG']) state.setState({[call._id+'detectedPPG']:true});
        state.setValue(call._id+'breath', data.breath);
    } 
    if (data.imu) {
        if(!state.data[call._id+'detectedIMU']) state.setState({[call._id+'detectedIMU']:true});
        state.setValue(call._id+'imu', data.imu);
    } 
    if (data.env) {
        if(!state.data[call._id+'detectedENV']) state.setState({[call._id+'detectedENV']:true});
        state.setValue(call._id+'env', data.env);
    } //else if (ev.data.emg2) {}
}

//started from host end, see answerCall for peer end
export async function startCall(userId) {
    //send handshake
    let rtcId = `room${Math.floor(Math.random()*1000000000000000)}`;
    
    let nodes = setupAlerts(rtcId);

    let call = await webrtc.openRTC({ 
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
            console.log('Call started with', (call as RTCCallInfo).firstName, (call as RTCCallInfo).lastName);

            webrtc.rtc[call._id as string].run('ping').then((res) => {
                console.log('ping result should be pong. Result:', res);//test to validate connection, should ping the other's console.
            });

            //the call is now live, add tracks
            //data channel streams the device data
            enableDeviceStream(call._id); //enable my device to stream data to this endpoint
            
            const from = (call as RTCCallInfo).firstName + (call as RTCCallInfo).lastName;

            webrtc.rtc[call._id as string].ondata = (mev, channel) => {
                let data = JSON.parse(mev.data);
                onrtcdata(call, from, data);
                webrtc.receive(mev.data, channel, webrtc.rtc[call._id]);
                webrtc.setState({[call._id]:mev.data});
            }
        },
        ontrack:(ev) => {
            console.log('\n\n\nreceived track\n\n\n', ev);
        },
        onclose:() => {
            for(const key in nodes) {
                graph.remove(key,true);
            }
            delete webrtc.rtc[(call as RTCCallInfo)._id];
            state.setState({activeStream:undefined, availableStreams:webrtc.rtc, switchingUser:true});
        }
        // ondatachannel:(ev) => {
        //     //the call is now live, set ev.channel.onmessage function and add media tracks etc.
        // },
        // ontrack:(ev) => {
        //     //received a media track, e.g. audio or video
        // }
    });

    call.onnegotiationneeded = async (ev, description) => {//both ends need to set this function up when adding audio and video tracks freshly
    
        console.log('negotiating');

        usersocket.run(
            'runConnection', //run this function on the backend router
            [
                (webrtc.rtc[call._id as string] as RTCCallInfo).caller, //run this connection 
                'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                [ //and pass these arguments
                    'negotiateCall', //run this function on the user's end
                    [call._id, encodeURIComponent(JSON.stringify(description))]
                ],
                (webrtc.rtc[call._id as string] as RTCCallInfo).socketId
            ]
        ).then((description) => {
            if(description) console.log('remote description returned');
            else console.log('caller renegotiated');
            
            if(description) webrtc.negotiateCall(call._id as string, description);
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
                    description:encodeURIComponent(JSON.stringify(call.rtc.localDescription)), //the peer needs to accept this
                    caller:client.currentUser._id,
                    socketId:usersocket._id,
                    firstName:client.currentUser.firstName,
                    lastName:client.currentUser.lastName,
                    pictureUrl:client.currentUser.pictureUrl
                }
            ]
        ]
    );

    return call;
}

export let answerCall = async (call:RTCCallProps) => {
    
    let nodes = setupAlerts(call._id, ['hr','breath','fall']);
    
    call.onclose = () => {
        for(const key in nodes) {
            graph.remove(key,true);
        }
        delete webrtc.rtc[(call as RTCCallInfo)._id];
        state.setState({activeStream:undefined, availableStreams:webrtc.rtc, switchingUser:true});
        
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

    };

    const from = (call as RTCCallInfo).firstName + (call as RTCCallInfo).lastName;

    call.ondata = (mev, channel) => { 
        let data = JSON.parse(mev.data);
        onrtcdata(call, from, data);
        webrtc.receive(mev.data, channel, webrtc.rtc[(call as any)._id]);
        webrtc.setState({[(call as any)._id]:mev.data});
    }

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


export function enableDeviceStream(streamId, bufferInterval=500) { //enable sending data to a given RTC channel
    
    let stream = webrtc.rtc[streamId as string] as WebRTCInfo;

    let buffers = {
        emg:undefined,
        ecg:undefined,
        ppg:undefined,
        hr:undefined,
        breath:undefined,
        imu:undefined,
        env:undefined
    } as any;

    let tStart = performance.now();

    function BufferAndSend(data, buf) {
        let now = performance.now();
        if(now > tStart + bufferInterval) {
            stream.send({...buffers});
            tStart = now;
            buffers = {};
        } else {
            if(!buffers[buf]) buffers[buf] = {};
            for(const key in data) {
                if(!(key in buffers[buf])) {
                    if(Array.isArray(data[key]))
                        buffers[buf][key] = [...data[key]];
                    else buffers[buf][key] = [data[key]];
                }
                else {
                    if(Array.isArray((data[key])))
                        buffers[buf][key].push(...data[key]);
                    else
                        buffers[buf][key].push(data[key]);
                }
            }
        }
    }

    if(stream) {

        let subscriptions = {};

        subscriptions = {
            emg:state.subscribeEvent('emg', (emg) => {
                BufferAndSend(emg,'emg');
            }),
            ecg:state.subscribeEvent('ecg', (ecg) => {
                BufferAndSend(ecg,'ecg');
            }),
            ppg:state.subscribeEvent('ppg', (ppg) => {
                BufferAndSend(ppg,'ppg');
            }),
            hr:state.subscribeEvent('hr', (hr) => {
                BufferAndSend(hr,'hr');
            }),
            breath:state.subscribeEvent('breath', (breath) => {
                BufferAndSend(breath,'breath');
            }),
            imu:state.subscribeEvent('imu', (imu) => {
                BufferAndSend(imu,'imu');
            }),
            env:state.subscribeEvent('env', (env) => {
                BufferAndSend(env,'env');
            })
        };

        let oldonclose;
        if(stream.onclose) oldonclose = stream.onclose; 
        stream.onclose = () => {
            for(const key in subscriptions) {
                state.unsubscribeEvent(key, subscriptions[key]);
            }
            if(oldonclose) oldonclose();
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
