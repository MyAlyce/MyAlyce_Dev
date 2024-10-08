import React from 'react'
import {sComponent} from '../../state.component'

import { Chart } from '../DataVis/Chart';
import { ChartGroup } from '../DataVis/ChartGroup';


export class Device extends sComponent {
    
    state = { //synced with global state
        deviceConnected:false,
        activeStream:undefined
    }

    constructor(props:{
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[],
        streamId?:string,
        onlyOneActive?:boolean
    }) {
        super(props as any);
    }

    //TODO: add simple views like for the raw data e.g. heart rate, breath rate, HRV
    render() {

        return (
            <div>
                <div>{    
                    (this.state.deviceConnected || this.props.streamId) ? (
                            <ChartGroup 
                                streamId={this.props.streamId} 
                                sensors={this.props.sensors} 
                                onlyOneActive={this.props.onlyOneActive}
                            />
                        ) : (
                            <Chart sensors={['emg','ecg']} title={"EMG & ECG"}/>
                        )
                }</div>
            </div>
        )
    }
}