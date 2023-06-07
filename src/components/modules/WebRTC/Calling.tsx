import React, { useState } from "react"
import { Button, Col, Modal, Row } from "react-bootstrap"
import { client, getStreamById, splitCamelCase, state, webrtc, webrtcData } from "../../../scripts/client";
import { startCall, RTCCallInfo, RTCCallProps, answerCall, disableAudio, disableVideo, enableVideo, enableAudio, sendMessage, callHasMyStreamMedia } from "../../../scripts/webrtc";
import { sComponent } from "../../state.component";
import { Widget } from "../../widgets/Widget";
import { RTCVideo } from "./WebRTCStream";

import * as Icon from 'react-feather'
import { Avatar } from "../User/Avatar";
import { BeatingSVG } from "../../svg/BeatingSVG/BeatingSVG";


export function StartCall(props:{userId:string|undefined, onClick?:(call?)=>void}) {
    return (
        <Button onClick={()=>{
            startCall(props.userId).then(call => {
                //overwrites the default message
                if(props.onClick) props.onClick(call);
            })}}
        >Start Call</Button>
    )
}

export function AnswerCall(props:{streamId:string, onClick?:(call?)=>void}) {
    return (
        <Button onClick={()=>{
            answerCall(webrtc.unanswered[props.streamId] as any).then(call => {
                //overwrites the default message
                if(props.onClick) props.onClick(call);
            })}}
        >Start Call</Button>
    )
}
export function UnanweredCallInfo(onAnswered?:(call:RTCCallInfo)=>{}) {
    let keys = Object.keys(state.data.unansweredCalls);

    let divs = [] as any;

    //console.log('getUnanweredCallInfo') //this should throw on the subscription event for receiveCallInformation

    for(const key of keys) {

        let call = state.data.unansweredCalls[key] as RTCCallProps;
 
        let divId = `call${call._id}`;

        divs.push(
            <div id={divId} key={divId}>
                <div>User: {call.firstName} {call.lastName}</div>
                <Button onClick={() => { 
                    answerCall(call as any).then(()=>{
                        if(onAnswered) onAnswered(webrtc.rtc[(call as any)._id] as RTCCallInfo); 
                    });} }>Join Call</Button>
            </div>
        );
    };


    return divs;
    //this.setState({});
    
}

export function AnswerCallModal (props:{streamId:string}) {
    const [show, setShow] = useState(true);
  
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    let call = state.data.unansweredCalls[props.streamId] as RTCCallProps;
    //console.log('answer call modal');
    
    return (
        <Modal show={show} onHide={handleClose} backdrop={false} style={{maxHeight:'500px'}}>
            <Modal.Header closeButton>
                <Modal.Title><Icon.PhoneCall className="align-text-bottom" color="red" size={26}></Icon.PhoneCall>&nbsp;Incoming Call</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            { call && 
                <Row  className='my-auto'>
                    <Col style={{whiteSpace:'nowrap'}}><BeatingSVG customContent={<>{call.pictureUrl ? <Avatar pictureUrl={call.pictureUrl}/> : null} | {call.firstName ? `${call.firstName} ${call.lastName}` : null }</>}/></Col>
                    <Col>
                        <Button 
                            onClick={() => {
                                answerCall(call);
                                handleClose();
                            }
                        }>Answer Call</Button></Col>
                </Row> 
            }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={()=>{
                    handleClose();
                }}>
                Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export class Messaging extends sComponent {

    messages=[] as any[];

    constructor(props:{streamId:string, renderMessages?:boolean, renderInput?:boolean}) {
        super(props);

        if(webrtcData.availableStreams[this.props.streamId].messages) 
            for(const message of webrtcData.availableStreams[this.props.streamId].messages) {
            let from = splitCamelCase(message.from);
            this.messages.push(
                <div key={this.messages.length}  className={message.streamId ? 'message-left' : 'message-right'}>
                    {from}: {message.message} | {new Date(message.timestamp).toLocaleTimeString()}
                </div>
            )
        }
    }

    makeMessage(message:any, from?) {
        return (
            <div key={this.messages.length} className={message.streamId ? 'message-left' : 'message-right'}>
                {message.streamId && (from + ': ')} {message.message} | {new Date(message.timestamp).toLocaleTimeString()}
            </div>
        )
    }

    componentDidMount() {
        this.messages = [] as any[];
        if(webrtcData.availableStreams[this.props.streamId].messages) 
            for(const message of webrtcData.availableStreams[this.props.streamId].messages) {
                let from = splitCamelCase(message.from);
                
                this.messages.push(
                    this.makeMessage(message,from)
                );
            }

        this.__subscribeComponent(this.props.streamId+'message',(newMessage)=>{
            let from = splitCamelCase(newMessage.from);
            this.messages.push(
                 this.makeMessage(newMessage,from)
            );
            this.setState({});
        });
    }

    componentWillUnmount(): void {
        this.__unsubscribeComponent(this.props.streamId+'message');
    }

    render() {
        let stream = getStreamById(this.props.streamId);

        let renderMessages = this.props.renderMessages ? this.props.renderMessages : true;
        let renderInput = this.props.renderInput ? this.props.renderInput : true;
        
    
        const send = (call:RTCCallInfo) => {
            let message = (document.getElementById(this.unique+'sendmessage') as HTMLInputElement).value;
            
            let result = sendMessage(call, message);
            
            if(renderMessages) {
                this.messages.push(this.makeMessage(result));
                
                this.setState({});
            }
        }
    
        return (<>
            { renderMessages ? <div id={this.unique + 'messages'}>
                    {this.messages ? this.messages.map(v => v): ""}
                </div> : null 
            }
            { renderInput ? <div>
                    <span  style={{float:'right'}}><input id={this.unique+'sendmessage'} type='text'></input><Button id={this.unique+'send'} onClick={()=>{ 
                        send(stream as RTCCallInfo); }}
                    ><Icon.Send color='white' size={15}/></Button></span>
                </div> 
                    : null 
            }
        </>);
    }

    

}


export class ToggleAudioVideo extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    hasAudio = false;
    hasVideo = false;

    constructor(props:{
        streamId:string, 
        audioOnClick?:(toggled:boolean)=>void,  
        videoOnClick?:(toggled:boolean)=>void,
        renderSelectors?:boolean
    }) {
        super(props);
    }

    async checkMedia() {
        callHasMyStreamMedia(this.props.streamId).then(res => {
            this.hasAudio = res?.hasAudio;
            this.hasVideo = res?.hasVideo;
            this.setState({})
        })
    }

    componentDidMount(): void {
        this.checkMedia();
    }

    render() {

        //console.log(hasAudio, hasVideo);
        let stream = getStreamById(this.props.streamId) as RTCCallInfo;

        return (
            <>
                {this.hasVideo ? <Icon.Video style={{cursor:'pointer'}} 
                    onClick={() => {
                        disableVideo(stream);
                        if(this.props.videoOnClick) this.props.videoOnClick(false);
                        this.hasVideo = false;
                        this.setState({});
                }} /> : <Icon.VideoOff style={{cursor:'pointer'}}  
                    onClick={async () => {
                        await enableVideo(stream, this.state.selectedVideo ? {deviceId:this.state.selectedVideo} : undefined); //todo: deal with case of using e.g. a webcam for both audio and video
                        if(this.props.videoOnClick) this.props.videoOnClick(true);
                        this.hasVideo = true;
                        this.setState({});
                }}/>}
                {this.hasAudio ? <Icon.Mic style={{cursor:'pointer'}}  
                    onClick={async () => {
                        disableAudio(stream);
                        if(this.props.audioOnClick) this.props.audioOnClick(false);
                        this.hasAudio = false;
                        this.setState({});
                }}/> : <Icon.MicOff style={{cursor:'pointer'}}  
                    onClick={async () => {
                        if(this.hasVideo && this.state.selectedAudioIn === this.state.selectedVideo) {
                            disableVideo(stream);
                            await enableVideo(stream, this.state.selectedVideo ? {deviceId:this.state.selectedVideo} : undefined, {deviceId:this.state.selectedAudioIn});
                        }
                        else await enableAudio(stream, this.state.selectedAudioIn ? {deviceId:this.state.selectedAudioIn} : undefined);
                        if(this.props.audioOnClick) this.props.audioOnClick(true);
                        this.hasAudio = true;
                        this.setState({});
                }}/>}
                {this.props.renderSelectors && <MediaDeviceOptions/>}
            </>
        );
    }
}

export class ViewSelfVideoStream extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    constructor(props:{streamId:string, style?:string, className?:string}) {
        super(props);
    }

    render() {
        let stream = getStreamById(this.props.streamId) as RTCCallInfo;

        let videoTrack;
    
        stream?.senders?.forEach((s) => {
            if(s?.track?.kind === 'audio') {
            }
            if(s?.track?.kind === 'video') {
                videoTrack = s.track;
            }
        });

        //console.log('video track', videoTrack);

        if(videoTrack) {
            let s = new MediaStream();
            s.addTrack(videoTrack);
            
            return (<RTCVideo stream={s} className={this.props.className} style={this.props.style}/>)
        } else 
            return null;


    }
}

//uses global state to handle propagation
export class MediaDeviceOptions extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
        activeStream: '' as string
    }

    audioInDevices;
    audioOutDevices;
    cameraDevices;


    listMediaDevices() {
        return new Promise((res,rej) => {
            navigator.mediaDevices.enumerateDevices()
            .then((deviceInfos) => { //https://github.com/garrettmflynn/intensities/blob/main/app/index.js
                let ain = [] as any[]; let aout = [] as any[]; let cam = [] as any[];
                for (var i = 0; i !== deviceInfos.length; ++i) {
                    var deviceInfo = deviceInfos[i];
                    var option = (<option key={deviceInfo.deviceId} value={deviceInfo.deviceId}>{deviceInfo.label}</option>)//document.createElement('option');
                    //option.value = deviceInfo.deviceId;
                    //console.log(deviceInfo.kind, deviceInfo.deviceId);
                    if (deviceInfo.kind === 'videoinput') {
                        if(!this.state.selectedVideo) {
                            this.state.selectedVideo = deviceInfo.kind;
                        }
                        cam.push(option);
                        // option.text = deviceInfo.label || 'Camera ' +
                        //     (videoSelect.options.length + 1);
                        // this.camsrc.insertAdjacentElement('beforeend',option);
                    }
                    else if (deviceInfo.kind === 'audioinput') {
                        if(!this.state.selectedAudioIn) {
                            this.state.selectedAudioIn = deviceInfo.kind;
                        }
                        ain.push(option);
                        // option.text = deviceInfo.label ||
                        //     'Microphone ' + (audioInputSelect.options.length + 1);
                        // this.camsrc.insertAdjacentElement('beforeend',option);
                    } 
                    else if (deviceInfo.kind === 'audiooutput') {
                        if(!this.state.selectedAudioOut) {
                            this.state.selectedAudioOut = deviceInfo.kind;
                        }
                        aout.push(option);
                        // option.text = deviceInfo.label || 'Speaker ' +
                        //     (audioOutputSelect.options.length + 1);
                        //     this.camsrc.insertAdjacentElement('beforeend',option);
                    } 
                }

                this.audioInDevices=ain;
                this.audioOutDevices=aout;
                this.cameraDevices=cam;

                this.setState({});
    
                res({
                    audioInDevices:ain,
                    audioOutDevices:aout,
                    cameraDevices:cam
                });
    
            }).catch(rej);;
        })
    }
    
    render() {

        this.listMediaDevices();

        if(this.state.activeStream) {
            callHasMyStreamMedia(this.state.activeStream);
        }

        return (
            <Widget 
                title={"Voice and Video Options"}
                content={
                    <>
                        { this.audioInDevices?.length > 0 && ( 
                        <Row>
                            <Col>Mic In:</Col>   
                            <Col><select id={this.unique+'aIn'} onChange={(ev) => {
                                    this.setState({selectedAudioIn: ev.target.value});
                                }}>{this.audioInDevices}</select></Col>
                        </Row>)}
                        { this.audioOutDevices?.length > 0 && (
                        <Row>
                            <Col>Audio Out:</Col>
                            <Col><select id={this.unique+'aOut'} onChange={(ev) => {
                                this.setState({selectedAudioOut: ev.target.value});

                                }}>{this.audioOutDevices}</select></Col>
                        </Row>)}
                        { this.cameraDevices?.length > 0 && ( 
                        <Row>
                            <Col>Camera In:</Col>
                            <Col><select id={this.unique+'vIn'} onChange={(ev) => {
                                this.setState({selectedVideo: ev.target.value});

                            }}>{this.cameraDevices}</select></Col>
                        </Row>)}
                    </>
                }
            />
                
        );  
    }
}

export class CallSelf extends sComponent {
        
    state={
        unansweredCalls:undefined
    }

    render() {
        let ownCall;

        if(state.data.unansweredCalls) {
            for(const key in state.data.unansweredCalls) {
                let call = state.data.unansweredCalls[key] as RTCCallProps;
                if(client.currentUser._id === call.caller) {
                    ownCall = call;
                }
            }
        }
    
        return <>
            <Button onClick={()=>{ startCall(client.currentUser._id).then(call => {})} }>
                Call Myself
            </Button>
            {
                ownCall && <Button onClick={()=>{ answerCall(ownCall).then(()=>{this.setState({ activeStream:ownCall._id, triggerPageRerender:true });}); }}>Answer Self</Button>
            }
        </>
    }
    
}