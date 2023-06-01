import React from 'react'
import {sComponent} from '../state.component'

import { Chart } from './Chart';
import { ChartGroup } from './ChartGroup';



export class Device extends sComponent {
    
    state = { //synced with global state
        deviceConnected:false
    }

    streamId?:string;
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[];

    constructor(props:{
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[],
        streamId?:string
    }) {
        super(props as any);

        if(props.streamId) this.streamId = props.streamId;
        if(props.sensors) this.sensors = props.sensors;
    }

    //TODO: add simple views like for the raw data e.g. heart rate, breath rate, HRV
    render() {
        return (
            <div>
                <div>{    
                    this.state.deviceConnected ? (
                            <ChartGroup streamId={this.streamId} sensors={this.sensors}/>
                        ) : (
                            <Chart sensors={['emg','ecg']} title={"EMG & ECG"}/>
                        )
                }</div>
            </div>
        )
    }
}