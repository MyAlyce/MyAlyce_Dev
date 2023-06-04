import React from 'react'
import { sComponent } from '../state.component'
import { Device } from '../modules/Device/device'
import { UserBar } from '../modules/User/UserBar'
import { Widget } from '../widgets/Widget'
import { NoteTaking } from '../modules/Records/NoteTaking'
import { getActiveStream, getActiveStreamDir, state, webrtc } from '../../scripts/client'
import { RecordBar } from '../modules/Records/RecordBar'
import { CardGroup } from 'react-bootstrap'
import { RTCCallInfo, getCallLocation } from '../../scripts/webrtc'
import { RTCAudio, RTCVideo } from '../modules/WebRTC/WebRTCStream'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        deviceMode:'my-device',
        availableStreams:{}, //we can handle multiple connections too
    }

    componentDidMount(): void {
        if(this.state.activeStream) {
            this.__subscribeComponent(this.state.activeStream+'hasAudio');
            this.__subscribeComponent(this.state.activeStream+'hasVideo');
        }
    }

    componentWillUnmount(): void {
        if(this.state.activeStream) {
            this.__unsubscribeComponent(this.state.activeStream+'hasAudio');
            this.__unsubscribeComponent(this.state.activeStream+'hasVideo');
        }
    }

    render() {

        let dir = getActiveStreamDir();
        let call = getActiveStream();
        
        return (
            <div className='container-fluid'>
                <div className="main-content">
                    {/* Widgets */}
                    <Widget 
                        header={<h4>Dashboard</h4>}
                        title = {
                            <UserBar 
                                streamId={this.state.activeStream}
                                pinOnClick={call ? () => {
                                    getCallLocation(call as RTCCallInfo).then((res)=>{
                                        alert("Callee Location: "+JSON.stringify(res));
                                    });
                                } : undefined}
                                xOnClick={call ? () => {
                                    call?.terminate();
                                    delete webrtc.rtc[(call as RTCCallInfo)._id];
                                    this.setState({activeStream:false, triggerPageRerender:true, availableStreams:webrtc.rtc});
                                } : undefined}
                                videoOnClick={call ? (onState) => {
                                    this.setState({}); 
                                } : undefined}
                                audioOnClick={call ? (onState) => {
                                    this.setState({});
                                } : undefined}
                            />
                        }
                    />
                    <div className="device-section">
                        {/* Charts and stats */}
                        <Widget 
                            content = {<Device
                                streamId={ this.state.activeStream }
                                sensors={['ppg']}
                                onlyOneActive={true}
                            />}
                        />
                        <CardGroup>
                            <RecordBar
                                streamId={ this.state.activeStream }
                                dir = { dir }
                                // onChange={()=>{this.setState({});}}   
                            />
                            <NoteTaking 
                                showHistory={ false }
                                streamId={ this.state.activeStream } 
                                filename={ this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv' } 
                                dir={ dir }
                            />
                        </CardGroup>
                        {(call?.viewingVideo || call?.viewingAudio) &&
                            <CardGroup> 
                                { call?.viewingVideo && 
                                    <Widget
                                        content={
                                            <>
                                                <RTCVideo
                                                    call={call}
                                                />
                                            </>
                                        }
                                    />
                                }
                                {
                                    call?.viewingAudio && 
                                    <Widget
                                        content={
                                            <>
                                                <RTCAudio
                                                    audioOutId={state.data.selectedAudioOut}
                                                />
                                            </>
                                        }
                                    />
                                }
                            </CardGroup>
                        }
                        <NoteTaking 
                            showInput={ false }
                            streamId={ this.state.activeStream } 
                            filename={ this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv' } 
                            dir={ dir }
                        />
                    </div>
                </div>
            </div>
        )
    }

}
