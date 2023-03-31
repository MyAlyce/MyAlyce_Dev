import React from 'react'
import {sComponent} from './state.component'

import { EventHandler, WorkerInfo, WorkerRoute, state } from 'graphscript'//'../../../graphscript/index'//'graphscript'
import { connectDevice, disconnectDevice } from '../scripts/device';
import { WGLPlotter } from '../scripts/webglplot/plotter';

import plotworker from '../scripts/webglplot/canvas.worker'
import { WebglLineProps } from 'webgl-plot-utils';

import { max3010xChartSettings } from 'device-decoder/src/devices/max30102';
import { mpu6050ChartSettings } from 'device-decoder/src/devices/mpu6050';
import { bme280ChartSettings } from 'device-decoder/src/devices/bme280'
import { ads131m08ChartSettings } from 'device-decoder/src/devices/ads131m08';
import { DeviceConnect } from './DeviceConnect';
import { Chart } from './Chart';



export class Device extends sComponent {
    
    state = { //synced with global state
        deviceConnected:false,
        device:undefined
    }

    remote = false;
    lines?:{[key:string]:WebglLineProps};
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[];
    deviceId?:string;

    constructor(props:{
        remote?:boolean
        lines?:{[key:string]:WebglLineProps},
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],
        deviceId?:string
    }) {
        super(props as any);

        if(props.remote) this.remote = props.remote;
        if(props.lines) this.lines = props.lines;
        if(props.sensors) this.sensors = props.sensors;
        if(props.deviceId) this.deviceId = props.deviceId;
    }

    render() {
        return (
            <div>
                { !this.remote && 
                    <DeviceConnect/>
                }
                <Chart
                    lines={this.lines}
                    sensors={this.sensors}
                    deviceId={this.deviceId}
                />
            </div>
        )
    }
}