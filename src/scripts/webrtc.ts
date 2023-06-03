
import { client, graph, usersocket, state, webrtc, getStreamById } from "./client"
import { recordChat, recordEvent } from "./datacsv";

import { onAlert, setupAlerts } from "./alerts";
import {WebRTCInfo, WebRTCProps} from 'graphscript'//'../../../graphscript/index'//
//https://hacks.mozilla.org/2013/07/webrtc-and-the-ocean-of-acronyms/


//the way these types are redundantly written just helps with the hints in VSCode fyi, no need to go digging
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
    audioSender?:RTCRtpSender,

    //set by rtc peer
    hasVideo?:boolean,
    hasAudio?:boolean,

    //for ui controls
    viewingVideo?:boolean,
    viewingAudio?:boolean,

    recordingVideo?:boolean,
    recordingAudio?:boolean,

    //for audio controls
    srcNode?:any,
    filterNode?:any
    gainNode?:any
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
    
    //set by rtc peer
    hasVideo?:boolean,
    hasAudio?:boolean,

    videoSender?:RTCRtpSender, 
    audioSender?:RTCRtpSender,

    //for ui controls
    viewingVideo?:boolean,
    viewingAudio?:boolean,

    recordingVideo?:boolean,
    recordingAudio?:boolean,

    //for audio controls
    srcNode?:any,
    filterNode?:any
    gainNode?:any
}

export function getCallLocation(call:RTCCallInfo) {
    return call.run('getCurrentLocation'); //run geolocation at endpoint
}

export const onrtcdata = (call, from, data) => { 

    //console.log( 'received',data);

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
    if (data.media) {
        if('hasVideo' in data.media) {
            call.hasVideo = data.media.hasVideo;
            if(call.hasVideo === false) state.setState({[call._id+'hasVideo']:false}); //use ontrack event to set to true
        }
        if('hasAudio' in data.media) {
            call.hasAudio = data.media.hasAudio;
            if(call.hasAudio === false) state.setState({[call._id+'hasAudio']:false}); //use ontrack event to set to true
        }
    }
}

export function genCallSettings(userId, rtcId, alertNodes?) {

    return {
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
            console.log('Call started with', (webrtc.rtc[rtcId] as RTCCallInfo).firstName, (webrtc.rtc[rtcId] as RTCCallInfo).lastName);

            webrtc.rtc[rtcId as string].run('ping').then((res) => {
                console.log('ping result should be pong. Result:', res);//test to validate connection, should ping the other's console.
            });

            //the webrtc.rtc[rtcId] is now live, add tracks
            //data channel streams the device data
            enableDeviceStream(rtcId); //enable my device to stream data to this endpoint

            state.setState({ activeStream:rtcId, switchingUser:true });
        },
        ondata: (mev, channel) => {
            let data = JSON.parse(mev.data);
            onrtcdata(webrtc.rtc[rtcId], (webrtc.rtc[rtcId] as RTCCallInfo).firstName+(webrtc.rtc[rtcId] as RTCCallInfo).lastName, data);

            //stock functions for the webrtc service, e.g. you can webrtc.rtc[rtcId] anything on each other's endpoints
            webrtc.receive(mev.data, channel, webrtc.rtc[rtcId]);
            webrtc.setState({[rtcId]:mev.data});
        },
        onnegotiationneeded: async (ev, description) => {//both ends need to set this function up when adding audio and video tracks freshly
    
            //console.log('negotiating');

            usersocket.run(
                'runConnection', //run this function on the backend router
                [
                    (webrtc.rtc[rtcId] as RTCCallInfo).caller, //run this connection 
                    'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                    [ //and pass these arguments
                        'negotiateCall', //run this function on the user's end
                        [rtcId, encodeURIComponent(JSON.stringify(description))]
                    ],
                    (webrtc.rtc[rtcId] as RTCCallInfo).socketId
                ]
            ).then((description) => {
                //if(description) console.log('remote description returned');
                //else console.log('caller renegotiated');
                
                if(description) webrtc.negotiateCall(rtcId as string, description);
            });
        },
        ontrack:(ev) => {
            console.log('\n\n\nreceived track\n\n\n', ev);

            if(ev.track.kind === 'audio') {
                (webrtc.rtc[rtcId] as RTCCallInfo).hasAudio = true;
                state.setState({ [rtcId+'hasAudio']:true });
            }
            if(ev.track.kind === 'video') {
                (webrtc.rtc[rtcId] as RTCCallInfo).hasVideo = true;
                state.setState({ [rtcId+'hasVideo']:true });
            }
        },
        onclose:() => {
            if(alertNodes)
                for(const key in alertNodes) {
                    graph.remove(key,true);
                }
            delete webrtc.rtc[(webrtc.rtc[rtcId] as RTCCallInfo)._id];
            state.setState({activeStream:undefined, availableStreams:webrtc.rtc, switchingUser:true});
        }
    }
}

//started from host end, see answerCall for peer end
export async function startCall(userId) {
    //send handshake
    let rtcId = `room${Math.floor(Math.random()*1000000000000000)}`;
    
    let nodes = setupAlerts(rtcId);

    let call = await webrtc.openRTC({ 
        _id:rtcId,
        ...genCallSettings(userId,rtcId,nodes)
    });

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

    Object.assign(call,{
        ...genCallSettings(call.caller, call._id, nodes)
    });

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
    
    //console.log('received call information:', id);

    //console.log(graph.__node.state, state, graph.__node.state.data.receiveCallInformation, state.data.receiveCallInformation);
        
    let call = webrtc.unanswered[id] as WebRTCProps & {caller:string, firstName:string, lastName:string, socketId:string};
         
    if(call) {
    
        state.setState({
            unansweredCalls:webrtc.unanswered
        }); //update this event for the app
    
    }
});


export function callHasMyAudioVideo(streamId:string) {
    
    let stream = getStreamById(streamId) as RTCCallInfo;
    let hasAudio; let hasVideo;
    let videoTrack; let audioTrack;
    
    stream?.senders?.forEach((s) => {
        let videoEnabledInAudio = false;
        if(s?.track?.kind === 'audio') {
            hasAudio = true;
            if((s as any).deviceId && state.data.selectedAudioIn && (s as any).deviceId !== state.data.selectedAudioIn) {
                disableAudio(stream);
                if(hasVideo && state.data.selectedAudioIn === state.data.selectedVideo) {
                    disableVideo(stream);
                    enableVideo(stream, state.data.selectedVideo ? {deviceId:state.data.selectedVideo} : undefined, true);
                    videoEnabledInAudio = true;
                }
                else enableAudio(stream, state.data.selectedAudioIn ? {deviceId:state.data.selectedAudioIn} : undefined);
            }
        }
        if(s?.track?.kind === 'video') {
            hasVideo = true;
            if((s as any).deviceId && state.data.selectedVideo && (s as any).deviceId !== state.data.selectedVideo && !videoEnabledInAudio) {
                disableVideo(stream);
                enableVideo(stream, state.data.selectedVideo ? {deviceId:state.data.selectedVideo} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
            }
        }
    });

    return {
        hasAudio, hasVideo,
        audioTrack, videoTrack
    };
}

export function getCallerAudioVideo(streamId:string) {
    let stream = getStreamById(this.props.streamId) as RTCCallInfo;

    let hasAudio; let hasVideo;
    let audioTrack; let videoTrack;

    if(stream.videoSender) {
        hasVideo = true;
        videoTrack = stream.videoSender.track;
    }
    if(stream.audioSender) {
        hasAudio = true;
        audioTrack = stream.audioSender.track;
    }

    return {
        hasAudio, hasVideo,
        audioTrack, videoTrack
    };

}


export let streamSubscriptions = {};

export function enableDeviceStream(streamId, bufferInterval=100) { //enable sending data to a given RTC channel
    
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
            ///console.log( 'sent', buffers);
            if((stream.channels?.['data'] as RTCDataChannel).readyState === 'open')
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

        streamSubscriptions[streamId] = {
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
            if(streamSubscriptions[streamId]) for(const key in streamSubscriptions[streamId]) {
                state.unsubscribeEvent(key, streamSubscriptions[streamId]?.[key]);
            }
            delete streamSubscriptions[streamId];
            if(oldonclose) oldonclose();
        }    
        
        return streamSubscriptions[streamId];
    }
    
}

export function disableDeviceStream(streamId) {

    if(streamSubscriptions[streamId]) for(const key in streamSubscriptions[streamId]) {
        state.unsubscribeEvent(key, streamSubscriptions[streamId]?.[key]);
    }
    delete streamSubscriptions[streamId];
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

    return senders;
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

    return senders;
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

