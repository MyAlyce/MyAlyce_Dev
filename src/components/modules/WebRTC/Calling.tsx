import React from "react"
import { Button } from "react-bootstrap"
import { client, state, webrtc } from "../../../scripts/client";
import { startCall, RTCCallInfo, RTCCallProps, answerCall } from "../../../scripts/webrtc";
import { ProfileStruct } from "graphscript-services/struct/datastructures/types";
import { sComponent } from "../../state.component";
import { Widget } from "../../widgets/Widget";

export function StartCall(user:Partial<ProfileStruct>) {
    return (
        <Button onClick={()=>{
            startCall(user._id).then(call => {
                //overwrites the default message
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


export function Messaging() {

}

export function MessagingModal() {
        
}

//uses global state to handle propagation
export class MediaDeviceOptions extends sComponent {

    state={
        selectedVideo: '' as string,
        selectedAudioIn: '' as string,
        selectedAudioOut: '' as string,
    }

    audioInDevices;
    audioOutDevices;
    cameraDevices;

    componentDidMount(): void {
        this.listMediaDevices();
    }

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
        return (
            <Widget 
                title={"Voice and Video Options"}
                content={
                    <>
                        { this.audioInDevices?.length > 0 && ( <div>Mic In:    <select id={this.unique+'aIn'} onChange={(ev) => this.setState({selectedAudioIn: ev.target.value})}>{this.audioInDevices}</select>
                        </div>)}
                        { this.audioOutDevices?.length > 0 && (<div>Audio Out: <select id={this.unique+'aOut'} onChange={(ev) => this.setState({selectedAudioOut: ev.target.value})}>{this.audioOutDevices}</select> 
                        </div>)}
                        { this.cameraDevices?.length > 0 && (  <div>Camera In: <select id={this.unique+'vIn'} onChange={(ev) => this.setState({selectedVideo: ev.target.value})}>{this.cameraDevices}</select>
                        </div>)}
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
                ownCall && <Button onClick={()=>{ answerCall(ownCall).then(()=>{this.setState({ activeStream:ownCall._id, switchingUser:true });}); }}>Answer Self</Button>
            }
        </>
    }
    
}