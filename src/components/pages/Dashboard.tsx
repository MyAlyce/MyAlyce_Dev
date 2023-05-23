import React from 'react'
import { sComponent } from '../state.component'
import { Device } from '../modules/device'
import { StreamSelect } from '../modules/StreamSelect'
import { NoteTaking } from '../modules/NoteTaking'

import { client, webrtc } from '../../scripts/client';
import { RTCCallInfo } from '../../scripts/webrtc'
import { DeviceConnect } from '../modules/DeviceConnect'
import { Demo } from '../modules/DemoMode'
import {Statistics} from '../ui/Statistics'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        deviceMode:'my-device',
        availableStreams:{}, //we can handle multiple connections too
    }


    render() {

        //console.log(client.currentUser)
        return (
            <div className='container-fluid'>
                <h1>Welcome {client.currentUser.firstName}</h1>
                <div className="stream-select">
                    {/* Device/Stream select */}
                        <StreamSelect 
                            onChange={(key) => { 
                                this.setState({deviceMode:key});
                            }} 
                        />
                    {/** Device Connect */}
                    { this.state.deviceMode === 'my-device' ? 
                            <DeviceConnect/> : 
                        this.state.deviceMode === 'demo' ? 
                            <Demo/> : ""
                    }
                </div>
                <div className="main-content">
                    {/* Chart */}
                    
                    <div className="device-section">
                    <Statistics />

                       {/*<Device
                            streamId={this.state.activeStream}
                            //sensors={['ecg','emg',]}
                />*/} 
                    </div>
                    <div className="note-taking-section">
                       {/* <NoteTaking streamId={this.state.activeStream} filename={this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName + (webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName + '.csv' : 'Notes.csv'} />*/}
                    </div>
                </div>
            </div>
        )
    }

}
