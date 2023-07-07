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
import { getCurrentLocation } from '../../scripts/alerts'
import { PopupModal } from '../modules/Modal/Modal'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        deviceMode:'my-device',
        availableStreams:{}, //we can handle multiple connections too
        viewVitals:false
    }

    selectedCoords?:any;

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
        
        console.log('dashboard rendered', this.state.activeStream);
        return (
            <div className="main-content d-flex flex-column" style={{gap: '10px'}}>
                { this.selectedCoords && <PopupModal
                    defaultShow={true}
                    body={
                        <iframe width="100%" height="500px" style={{border:0}} loading="lazy" allowFullScreen={true}
                            src={`https://www.google.com/maps/embed/v1/place?q=${this.selectedCoords}&key=AIzaSyDxBHuENbHVlbSj_v0ezWSqIw3JsxAsprc`}></iframe>
                    }
                    onClose={()=>{this.selectedCoords = null; this.setState({})}}
                />
                }
                {/* Widgets */}
                <Widget 
                    title = {
                        <UserBar 
                            streamId={this.state.activeStream}
                            useActiveStream={true}
                            pinOnClick={call ? () => {
                                getCallLocation(call as RTCCallInfo).then((res)=>{
                                    if(res?.latitude) {
                                        this.selectedCoords = `${res?.latitude},${res?.longitude}`
                                        this.setState({});
                                    }
                                });
                            } : () => {
                                getCurrentLocation().then((res) => {
                                    if(res?.latitude) {
                                        this.selectedCoords = `${res?.latitude},${res?.longitude}`
                                        this.setState({});
                                    }
                                });
                            }}
                            vitalsOnClick={() => {
                                this.setState({viewVitals:!this.state.viewVitals})
                            }}
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
                    {/* Charts and stats */}
                    {this.state.viewVitals &&
                        <Widget 
                            content = {
                                <Device
                                    streamId={ this.state.activeStream }
                                    sensors={['ppg']}
                                    onlyOneActive={true}
                                />
                            }
                        />
                    } 
                    
                    <CardGroup>
                        <RecordBar
                            streamId={ this.state.activeStream }
                            dir = { dir }
                            // onChange={()=>{this.setState({});}}   
                        />
                        {/* <NoteTaking 
                            showHistory={ false }
                            streamId={ this.state.activeStream } 
                            filename={ this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv' } 
                            dir={ dir }
                        /> */}
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
                                                call={call}
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
        )
    }

}
