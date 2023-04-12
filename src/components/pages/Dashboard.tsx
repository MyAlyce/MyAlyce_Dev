import React from 'react'
import { sComponent } from '../state.component'
import { Device } from '../modules/device'
import { StreamSelect } from '../modules/StreamSelect'
import { NoteTaking } from '../modules/NoteTaking'

import { client, webrtc } from '../../scripts/client';
import { RTCCallInfo } from '../../scripts/webrtc'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        availableStreams:{}, //we can handle multiple connections too
    }


    render() {

        //console.log(client.currentUser)
        return (
            <div className='div'>
                <h1>Welcome {client.currentUser.firstName}</h1>
                <div>
                {/*Device/Stream select */}
                    <StreamSelect onChange={(ev)=>{ this.setState({activeStream:ev.target.value});}}/>
                </div>
                {/*Chart*/}
                <div>
                    <Device 
                        remote={!!this.state.activeStream}
                        streamId={this.state.activeStream}
                    />
                    <NoteTaking streamId={this.state.activeStream} filename={this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName+(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName+'.csv' : 'Notes.csv'}/>
                </div>
            </div>
        )
    }

}
