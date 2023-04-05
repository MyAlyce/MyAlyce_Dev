import React from 'react'
import {sComponent} from './state.component'


import { DeviceConnect } from './DeviceConnect';
import { Chart } from './Chart';
import { StreamSelect } from './StreamSelect';
import { ChartGroup } from './ChartGroup';



export class Device extends sComponent {
    
    state = { //synced with global state
        deviceConnected:false,
        activeStream:undefined
    }

    remote = false;
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[];

    constructor(props:{
        remote?:boolean,
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],
        streamId?:string
    }) {
        super(props as any);

        if(props.remote) this.remote = props.remote;
        if(props.sensors) this.sensors = props.sensors;
    }

    render() {
        return (
            <div>
                <div>
                    { !this.remote ? 
                    <DeviceConnect/> : ""
                    }
                </div>
                <div>{    
                    this.state.deviceConnected ? (<ChartGroup streamId={this.state.activeStream}/>) : (<Chart sensors={['emg']}/>)
                }
                </div>
            </div>
        )
    }
}