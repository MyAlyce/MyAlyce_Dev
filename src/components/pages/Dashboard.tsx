import React from 'react'
import { sComponent } from '../state.component'
import { Device } from '../modules/device'
import { StreamSelect } from '../modules/StreamSelect'
import { NoteTaking } from '../modules/NoteTaking'

import { client, webrtc } from '../../scripts/client';
import { RTCCallInfo } from '../../scripts/webrtc'
import { DeviceConnect } from '../modules/DeviceConnect'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        availableStreams:{}, //we can handle multiple connections too
    }


    render() {

        //console.log(client.currentUser)
        return (
            <div className="page-container">
                <h1>Welcome {client.currentUser.firstName}</h1>
                <div className="stream-select">
                    {/* Device/Stream select */}
                        <StreamSelect onChange={(ev) => { this.setState({ activeStream: ev.target.value }); }} />
                    {/** Device Connect */}
                    { !this.state.activeStream ? 
                        <DeviceConnect/> : ""
                    }
                </div>
                <div className="main-content">
                    {/* Chart */}
                    <div className="device-section">
                        <Device
                            streamId={this.state.activeStream}
                        />
                    </div>
                    <div className="note-taking-section">
                        <NoteTaking streamId={this.state.activeStream} filename={this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName + (webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName + '.csv' : 'Notes.csv'} />
                    </div>
                </div>
            </div>
        )
    }

}
