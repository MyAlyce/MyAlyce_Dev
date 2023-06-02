import React from 'react'
import { sComponent } from '../state.component'
import { Device } from '../modules/device'
import { UserBar } from '../ui/UserBar/UserBar'
import { Widget } from '../widgets/Widget'
import { NoteTaking } from '../modules/NoteTaking'
import { getActiveStreamDir } from '../../scripts/client'
import { RecordBar } from '../modules/RecordBar'
import { CardGroup } from 'react-bootstrap'

export class Dashboard extends sComponent {

    state = { //synced with global state
        activeStream:undefined, //stream selected?
        deviceMode:'my-device',
        availableStreams:{}, //we can handle multiple connections too
    }

    render() {

        let dir = getActiveStreamDir();

        return (
            <div className='container-fluid'>
                <div className="main-content">
                    {/* Widgets */}
                    <Widget 
                        header={<h4>Dashboard</h4>}
                        title = {
                            <UserBar streamId={this.state.activeStream}/>
                        }
                    />
                    <div className="device-section">
                        {/* Charts and stats */}
                        <Widget 
                            content = {<Device
                                streamId={this.state.activeStream}
                                sensors={['ppg']}
                                onlyOneActive={true}
                            />}
                        />
                        <CardGroup>
                            <NoteTaking 
                                showHistory={ false }
                                streamId={ this.state.activeStream } 
                                filename={ this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv' } 
                                dir={ dir }
                            />
                            <RecordBar
                                streamId={ this.state.activeStream }
                                dir = { dir }
                                // onChange={()=>{this.setState({});}}   
                            />
                        </CardGroup>
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
