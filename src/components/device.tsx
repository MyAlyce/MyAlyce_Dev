import React from 'react'
import {sComponent} from './state.component'

import { EventHandler, WorkerInfo, WorkerRoute, state } from 'graphscript';
import { connectDevice, disconnectDevice } from '../scripts/device';
import { WGLPlotter } from '../scripts/webglplot/plotter';

import plotworker from '../scripts/webglplot/canvas.worker'
import { WebglLineProps } from 'webgl-plot-utils';
import { nrf5x_usbChartSettings } from 'device-decoder/dist/src/devices/nrf5x_usb';
import { max3010xChartSettings } from 'device-decoder/dist/src/devices/max30102';
import { mpu6050ChartSettings } from 'device-decoder/dist/src/devices/mpu6050';
import { bme280ChartSettings } from 'device-decoder/dist/src/devices/bme280'
import { ads131m08ChartSettings } from 'device-decoder/dist/src/devices/ads131m08';



export class DeviceComponent extends sComponent {
    
    state = {
        deviceConnected:false,
        device:undefined,
        remote:false
    }

    canvas = document.createElement('canvas');
    overlay = document.createElement('canvas');
    plotter:WGLPlotter;
    subscriptions={} as any;

    constructor(props:{
        remote?:boolean
        lines?:{[key:string]:WebglLineProps},
        deviceId?:string
    }) {
        super(props as any);

        if(props.remote) this.state.remote = props.remote;

        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.overlay.style.position = 'absolute';
        this.overlay.style.zIndex = '2';
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';

        //we can break these down into more toggleable plots next

        const defaultSettings = {
            hr: { sps: 1, nSec: 100, units: 'bpm' },
            hrv: { sps: 1, nSec: 100, units: 'bpm' },
            breath: { sps: 1, nSec: 100, units: 'bpm' },
            brv: { sps: 1, nSec: 100, units: 'bpm' },
            ...max3010xChartSettings.lines,
            ...mpu6050ChartSettings.lines,
            ...bme280ChartSettings.lines,
            //just showing the first 2 EMG/ECG channels for now...
            0: ads131m08ChartSettings.lines?.['0'] as WebglLineProps,
            1: ads131m08ChartSettings.lines?.['1'] as WebglLineProps
        };

        //we are appending the canvas and overlay this way so they only need to be transferred once to the plotter thread 
        this.plotter = new WGLPlotter({
            canvas:this.canvas,
            overlay:this.overlay,
            lines:props.lines ? props.lines : defaultSettings, //will render all lines unless specified
            generateNewLines:true,
            cleanGeneration:false,
            worker:plotworker
        });

        Object.assign(this.subscriptions,{
            emg:state.subscribeEvent(props.deviceId ? props.deviceId+'emg' : 'emg', (data) => {
                this.plotter.__operator({ 0:data[0], 1:data[1] });
            }),
            ppg:state.subscribeEvent(props.deviceId ? props.deviceId+'ppg' :'ppg', (ppg) => {
                this.plotter.__operator(ppg);
            }),
            hr:state.subscribeEvent(props.deviceId ? props.deviceId+'hr' :'hr', (hr) => {
                this.plotter.__operator({
                    hr: hr.bpm,
                    hrv: hr.change
                });
            }),
            breath:state.subscribeEvent(props.deviceId ? props.deviceId+'breath' :'breath', (breath) => {
                this.plotter.__operator({
                    breath:breath.bpm,
                    brv:breath.change
                });
            }),
            imu:state.subscribeEvent(props.deviceId ? props.deviceId+'imu' :'imu', (imu) => {
                this.plotter.__operator(imu);
            }),
            env:state.subscribeEvent(props.deviceId ? props.deviceId+'env' :'env', (env) => {
                this.plotter.__operator(env);
            })
        });

    }

    componentWillUnmount(): void {
        for(const key of this.subscriptions) {
            state.unsubscribeEvent(key, this.subscriptions[key]);
        }
    }

    render() {
        return (
            <div>
                { !this.state.remote && 
                    <div>
                    { this.state.deviceConnected ? 
                        <button onClick={connectDevice}>Connect</button> :
                        <button onClick={disconnectDevice}>Disconnect</button>
                    } 
                    </div>
                }
                <div className='chartContainer'>
                    <div ref={ ref => {ref?.appendChild(this.canvas); ref?.appendChild(this.overlay);} }></div>
                    {/*this is an example of weird reactjs crap*/}
                </div>
            </div>
        )
    }
}