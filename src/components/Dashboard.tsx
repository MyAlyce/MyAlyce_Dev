import React from 'react'
import { sComponent } from './state.component'
import { DeviceComponent } from './Device'
import { StreamSelect } from './StreamSelect'

export class Dashboard extends sComponent {

    state = { //synced with global state
        streamSelected:undefined, //stream selected?
        availableStreams:{}, //we can handle multiple connections too
    }


    render() {

        return (
            <div>
                Dashboard:
                <hr/>
                <div>
                {/*Device/Stream select */}
                    <StreamSelect/>
                </div>
                {/*Chart*/}
                <div>
                    <DeviceComponent 
                        remote={!!this.state.streamSelected}
                        deviceId={this.state.streamSelected}
                    />
                </div>
            </div>
        )
    }

}
