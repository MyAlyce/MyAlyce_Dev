
import { client, graph, usersocket, state, webrtc, getStreamById, newCalls } from "./client"
import { recordChat, recordEvent } from "./datacsv";

import { onAlert, setupAlerts } from "./alerts";
import {WebRTCInfo, WebRTCProps} from 'graphscript'//'../../../graphscript/index'//
//https://hacks.mozilla.org/2013/07/webrtc-and-the-ocean-of-acronyms/

type RTCAppProps = {
    caller:string, 
    firstName:string, 
    lastName:string,
    pictureUrl:string, 
    socketId:string,  //hosted endpoint from server (as opposed to the RTC p2p route)

    unreadMessages:number,
    messages:{message:string, from:string, timestamp:number, streamId?:string}[],
    newEvents:boolean,
    events:{message:string, from:string, timestamp:number, streamId?:string}[], 
    newAlerts:boolean,
    alerts:{message:string, from:string, value:any, timestamp:number, streamId?:string}[], 
    
    //set by rtc peer
    hasVideo?:boolean,
    hasAudio?:boolean,

    //for ui controls
    viewingVideo?:boolean,
    viewingAudio?:boolean,

    recordingVideo?:boolean,
    recordingAudio?:boolean,

    videoSender?:boolean, 
    audioSender?:boolean,

    //for audio controls
    srcNode?:any,
    filterNode?:any
    gainNode?:any
}

//the way these types are redundantly written just helps with the hints in VSCode fyi, no need to go digging
export type RTCCallProps = WebRTCProps & RTCAppProps;
export type RTCCallInfo = WebRTCInfo & RTCAppProps;

export function getCallLocation(call:RTCCallInfo) {
    return call.run('getCurrentLocation'); //run geolocation at endpoint
}

export function sendMessage(call:RTCCallInfo, message:any) {
            
    if(!call.messages) call.messages = [] as any;
    
    let result = {message:message, timestamp:Date.now(), from:client.currentUser.firstName + client.currentUser.lastName};

    call.messages.push(result);
    call.send({message:result});

    return result;
}

export const onrtcdata = (call:RTCCallInfo, from:string, data:any) => { 

    //console.log( 'received',data);

    //some data structures for the app
    if(data.alert) {

        if(!(call as RTCCallInfo).events) (call as RTCCallInfo).alerts = [] as any;
        data.alert.streamId = call._id; //for marking that its a remote message (for styling mainly)
        (call as RTCCallInfo).alerts.push(data.alert);
        call.newAlerts = true;

        onAlert(data.alert,call._id);

        state.setValue(call._id+'alert',data.alert);
    }
    if(data.event) {

        if(!(call as RTCCallInfo).events) (call as RTCCallInfo).events = [] as any;
        data.event.streamId = call._id; //for marking that its a remote message (for styling mainly)
        call.newEvents = true;
        (call as RTCCallInfo).events.push(data.event);
        
        recordEvent(from, data.event, call._id);

        state.setValue(call._id+'event', data.event);
    }
    if(data.message) {

        if(!(call as RTCCallInfo).messages) (call as RTCCallInfo).messages = [] as any;
        data.message.from = from;
        data.message.streamId = call._id; //for marking that its a remote message (for styling mainly)
        (call as RTCCallInfo).messages.push(data.message);
        
        if(state.data.isRecording) {
            recordChat(from, data.message, call._id);
        }

        if(!call.unreadMessages) call.unreadMessages = 0;
        call.unreadMessages++;

        state.setValue(call._id+'message',data.message);
    }

    //sensor data
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
            call.viewingVideo = data.media.hasVideo;
            state.setState({[call._id+'hasVideo']:data.media.hasVideo, triggerPageRerender:true}); //use ontrack event to set to true
        }
        if('hasAudio' in data.media) {
            call.hasAudio = data.media.hasAudio;
            call.viewingVideo = data.media.hasAudio;
            state.setState({[call._id+'hasAudio']:data.media.hasAudio, triggerPageRerender:true}); //use ontrack event to set to true
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
                    //console.log('call information echoed from peer:', id);
                });
            }
        },
        ondatachannel: (ev) => {
            console.log('Call started with', (webrtc.rtc[rtcId] as RTCCallInfo).firstName, (webrtc.rtc[rtcId] as RTCCallInfo).lastName);

            webrtc.rtc[rtcId as string].run('ping').then((res) => {
                console.log('ping result should be pong. Result:', res);//test to validate connection, should ping the other's console.
            });

            alertNodes = setupAlerts(rtcId);

            //the webrtc.rtc[rtcId] is now live, add tracks
            //data channel streams the device data
            enableDeviceStream(rtcId); //enable my device to stream data to this endpoint

            state.setState({ activeStream:rtcId, deviceMode:rtcId, triggerPageRerender:true }); //switch over to new call
        },
        ondata: (mev, channel) => {
            let data = JSON.parse(mev.data);
            onrtcdata(webrtc.rtc[rtcId] as RTCCallInfo, (webrtc.rtc[rtcId] as RTCCallInfo).firstName+(webrtc.rtc[rtcId] as RTCCallInfo).lastName, data);

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
            //console.log('\n\n\nreceived track\n\n\n', ev);

            setTimeout(() => {
                if(ev.track.kind === 'audio') {
                    (webrtc.rtc[rtcId] as RTCCallInfo).hasAudio = true;
                    (webrtc.rtc[rtcId] as RTCCallInfo).viewingAudio = true;
                    state.setState({ [rtcId+'hasAudio']:true, triggerPageRerender:true });
                }
                if(ev.track.kind === 'video') {
                    (webrtc.rtc[rtcId] as RTCCallInfo).hasVideo = true;
                    (webrtc.rtc[rtcId] as RTCCallInfo).viewingVideo = true;
                    state.setState({ [rtcId+'hasVideo']:true, triggerPageRerender:true });
                }

            }, 500);
        },
        onclose:() => {
            if(alertNodes)
                for(const key in alertNodes) {
                    graph.remove(key,true);
                }
            delete webrtc.rtc[(webrtc.rtc[rtcId] as RTCCallInfo)._id];
            state.setState({activeStream:undefined, availableStreams:webrtc.rtc, triggerPageRerender:true});
        }
    }
}

//started from host end, see answerCall for peer end
export async function startCall(userId) {
    //send handshake
    let rtcId = `room${Math.floor(Math.random()*1000000000000000)}`;

    let call = await webrtc.openRTC({ 
        _id:rtcId,
        ...genCallSettings(userId,rtcId)
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
    if(!call) return;
    
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

    delete newCalls[call._id as string];

    state.setState({
        activeStream:call._id,
        availableStreams:webrtc.rtc,
        deviceMode:call._id,
    });
}

export function listMediaDevices() {
    return new Promise((res,rej) => {
        navigator.mediaDevices.enumerateDevices()
        .then((deviceInfos) => { //https://github.com/garrettmflynn/intensities/blob/main/app/index.js
            let ain = [] as any[]; let aout = [] as any[]; let cam = [] as any[];
            for (var i = 0; i !== deviceInfos.length; ++i) {
                var deviceInfo = deviceInfos[i];
                var option = deviceInfo;
                if (deviceInfo.kind === 'videoinput') {
                    if(!state.data.selectedVideo) {
                        state.setState({selectedVideo:deviceInfo.kind});
                    }
                    cam.push(option);
                }
                else if (deviceInfo.kind === 'audioinput') {
                    if(!state.data.selectedAudioIn) {
                        state.setState({selectedAudioIn:deviceInfo.kind});
                    }
                    ain.push(option);
                } 
                else if (deviceInfo.kind === 'audiooutput') {
                    if(!state.data.selectedAudioOut) {
                        state.setState({selectedAudioOut:deviceInfo.kind});
                    }
                    aout.push(option);
                } 
            }

            res({
                audioInDevices:ain,
                audioOutDevices:aout,
                cameraDevices:cam
            });

        }).catch(rej);;
    });
}


//my local call streams
export async function callHasMyStreamMedia(streamId:string) {
    
    let stream = getStreamById(streamId) as RTCCallInfo;
    let hasAudio; let hasVideo;
    let videoEnabledInAudio;
    
    if(stream?.senders) {
        for(const s of stream.senders) {
            let videoEnabledInAudio = false;
            if(s?.track?.kind === 'audio') {
                hasAudio = true;
                if((s as any).deviceId && state.data.selectedAudioIn && (s as any).deviceId !== state.data.selectedAudioIn) {
                    disableAudio(stream);
                    if(hasVideo && state.data.selectedAudioIn === state.data.selectedVideo) {
                        disableVideo(stream);
                        await enableVideo(stream, state.data.selectedVideo ? {deviceId:state.data.selectedVideo} : undefined, true);
                        videoEnabledInAudio = true;
                    }
                    else enableAudio(stream, state.data.selectedAudioIn ? {deviceId:state.data.selectedAudioIn} : undefined);
                }
            }
            if(s?.track?.kind === 'video') {
                hasVideo = true;
                if((s as any).deviceId && state.data.selectedVideo && (s as any).deviceId !== state.data.selectedVideo && !videoEnabledInAudio) {
                    disableVideo(stream);
                    await enableVideo(stream, state.data.selectedVideo ? {deviceId:state.data.selectedVideo} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
                }
            }
        }
    }

    return {
        hasAudio, hasVideo, videoEnabledInAudio
    };
}

//call streams from endpoint
export function getCallerAudioVideo(streamId:string) {
    let stream = getStreamById(streamId) as RTCCallInfo;


    let hasAudio; let hasVideo;
    let audioStream; let videoStream;

    videoStream = stream.streams?.find((s) => (s as MediaStream)?.getVideoTracks().length > 0);
    audioStream = stream.streams?.find((s) => (s as MediaStream)?.getAudioTracks().length > 0);
    
    hasVideo = videoStream !== undefined;
    hasAudio = audioStream !== undefined;

    return {
        hasAudio, hasVideo,
        audioStream, videoStream
    };

}


let tStart = performance.now();

export function BufferAndSend(data:any, bufKey:string, stream:WebRTCInfo, buffers:{[key:string]:any[]}={}, bufferInterval=333) {
    let now = performance.now();

    if(!buffers[bufKey]) buffers[bufKey] = {} as any;
    for(const key in data) {
        if(!(key in buffers[bufKey])) {
            if(Array.isArray(data[key]))
                buffers[bufKey][key] = [...data[key]];
            else buffers[bufKey][key] = [data[key]];
        }
        else {
            if(Array.isArray((data[key])))
                buffers[bufKey][key].push(...data[key]);
            else
                buffers[bufKey][key].push(data[key]);
        }
    }

    if(now > tStart + bufferInterval) {
        if((stream.channels?.['data'] as RTCDataChannel).readyState === 'open')
            stream.send({...buffers});

        //console.log({...buffers});
        tStart = now;
        for (const key in buffers) delete buffers[key];
    }

    return buffers;
}


export let streamSubscriptions = {};

export function enableDeviceStream(streamId, bufferInterval=333) { //enable sending data to a given RTC channel
    
    let stream = webrtc.rtc[streamId as string] as WebRTCInfo;

    let buffers = {
        emg:undefined,
        ecg:undefined,
        ppg:undefined,
        hr:undefined,
        breath:undefined,
        imu:undefined,
        env:undefined //etc
    } as any;

    if(stream) {

        streamSubscriptions[streamId] = {
            emg:state.subscribeEvent('emg', (emg) => {
                buffers = BufferAndSend(emg,'emg',stream,buffers,bufferInterval);
            }),
            ecg:state.subscribeEvent('ecg', (ecg) => {
                buffers = BufferAndSend(ecg,'ecg',stream,buffers,bufferInterval);
            }),
            ppg:state.subscribeEvent('ppg', (ppg) => {
                buffers = BufferAndSend(ppg,'ppg',stream,buffers,bufferInterval);
            }),
            hr:state.subscribeEvent('hr', (hr) => {
                buffers = BufferAndSend(hr,'hr',stream,buffers,bufferInterval);
            }),
            breath:state.subscribeEvent('breath', (breath) => {
                buffers = BufferAndSend(breath,'breath',stream,buffers,bufferInterval);
            }),
            imu:state.subscribeEvent('imu', (imu) => {
                buffers = BufferAndSend(imu,'imu',stream,buffers,bufferInterval);
            }),
            env:state.subscribeEvent('env', (env) => {
                buffers = BufferAndSend(env,'env',stream,buffers,bufferInterval);
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


export async function enableAudio(call:RTCCallInfo, audioOptions:boolean|MediaTrackConstraints & {deviceId:string}=true) {
    let stream = await webrtc.enableAudio(call as any, audioOptions) as MediaStream;

    //call.send({media:{hasAudio:true}});
    return stream;
}

export async function enableVideo(
    call:RTCCallInfo, 
    videoOptions:(MediaTrackConstraints & {deviceId?:string, optional?:{minWidth: number}[] })  = {
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
    } as MediaTrackConstraints  & { deviceId?:string, optional?:{minWidth: number}[] },
    includeAudio:boolean|(MediaTrackConstraints & {deviceId?:string})=false
) { //the maximum available resolution will be selected if not specified
    let stream = await webrtc.enableVideo(call as any,videoOptions,includeAudio) as MediaStream;

    //let t = {hasVideo:true} as any;
    //if(includeAudio) t.hasAudio = true;
    //call.send({media:t});
    return stream;
}

export function disableAudio(call:RTCCallInfo) {
    webrtc.disableAudio(call as any);
    call.send({media:{hasAudio:false}}); //ontrack events will handle the true case
}

export function disableVideo(call:RTCCallInfo) {
    webrtc.disableVideo(call as any);
    call.send({media:{hasVideo:false}}); //ontrack events will handle the true case
}

