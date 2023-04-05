import React from 'react'
import { sComponent } from './state.component'
import { Device } from './device'
import { StreamSelect } from './StreamSelect'
import { NoteTaking } from './NoteTaking'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        availableStreams:{}, //we can handle multiple connections too
    }


    render() {

        return (
            <div>
                <div>
                {/*Device/Stream select */}
                    <StreamSelect/>
                </div>
                {/*Chart*/}
                <div>
                    <Device 
                        remote={!!this.state.activeStream}
                        streamId={this.state.activeStream}
                    />
                    <NoteTaking streamId={this.state.activeStream} filename={this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv'}/>
                </div>
            </div>
        )
    }

}
