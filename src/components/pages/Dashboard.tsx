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
                <div className="main-content">
                    {/* Widgets */}
                    <div className="device-section">
                        {/* Charts and stats */}
                       <Device
                            streamId={this.state.activeStream}
                            sensors={['ppg','hr']}
                        />
                    </div>
                    <div className="note-taking-section">
                       {/* <NoteTaking streamId={this.state.activeStream} filename={this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName + (webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName + '.csv' : 'Notes.csv'} />*/}
                    </div>
                </div>
            </div>
        )
    }

}
