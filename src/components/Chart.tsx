import React from 'react'
import {sComponent} from './state.component'

import { state } from 'graphscript'//'../../../graphscript/index'//
import { WGLPlotter } from '../scripts/webglplot/plotter';

import plotworker from '../scripts/webglplot/canvas.worker'
import { WebglLineProps } from 'webgl-plot-utils';

import { max3010xChartSettings } from 'device-decoder/src/devices/max30102';
import { mpu6050ChartSettings } from 'device-decoder/src/devices/mpu6050';
import { bme280ChartSettings } from 'device-decoder/src/devices/bme280'
import { ads131m08ChartSettings } from 'device-decoder/src/devices/ads131m08';



export class Chart extends sComponent {
    
    state = { //synced with global state
        deviceConnected:false,
        device:undefined
    }

    canvas = document.createElement('canvas');
    overlay = document.createElement('canvas');
    plotter:WGLPlotter;
    subscriptions={} as any;
    remote = false;

    constructor(props:{
        lines?:{[key:string]:WebglLineProps},
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],
        deviceId?:string
    }) {
        super(props as any);


        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.zIndex = '1';
        this.overlay.style.transform = 'translateY(-100%)'
        this.overlay.width = 800;
        this.overlay.height = 600;
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';

        let lines = props.lines ? props.lines : props.sensors ? {} : {
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

        if(props.sensors) {
            if(props.sensors.includes['emg']) {
                lines[0] = ads131m08ChartSettings.lines?.['0'] as WebglLineProps,
                lines[1] = ads131m08ChartSettings.lines?.['1'] as WebglLineProps
            }
            if(props.sensors.includes['ppg']) {
                Object.assign(lines,{
                    ...max3010xChartSettings.lines
                })
            }
            if(props.sensors.includes['hr']) {
                Object.assign(lines,{
                    hr: { sps: 1, nSec: 100, units: 'bpm' },
                    hrv: { sps: 1, nSec: 100, units: 'bpm' }
                })
            }
            if(props.sensors.includes['imu']) {
                Object.assign(lines,{
                    ...mpu6050ChartSettings.lines
                })
            }
            if(props.sensors.includes['breath']) {
                Object.assign(lines,{
                    breath: { sps: 1, nSec: 100, units: 'bpm' },
                    brv: { sps: 1, nSec: 100, units: 'bpm' }
                })
            }
            if(props.sensors.includes['env']) {
                Object.assign(lines,{
                    ...bme280ChartSettings.lines
                })
            }
        }

        //we are appending the canvas and overlay this way so they only need to be transferred once to the plotter thread 
        this.plotter = new WGLPlotter({
            canvas:this.canvas,
            overlay:this.overlay,
            lines, //will render all lines unless specified
            generateNewLines:true,
            cleanGeneration:false,
            worker:plotworker
        });

        if(!props?.sensors || props?.sensors?.includes['emg']) {
            this.subscriptions.emg = state.subscribeEvent(props.deviceId ? props.deviceId+'emg' : 'emg', (data) => {
                this.plotter.__operator({ 0:data[0], 1:data[1] });
            })
        }
        if(!props?.sensors || props?.sensors?.includes['ppg']) {
            this.subscriptions.ppg = state.subscribeEvent(props.deviceId ? props.deviceId+'ppg' :'ppg', (ppg) => {
                this.plotter.__operator(ppg);
            })
        }
        if(!props?.sensors || props?.sensors?.includes['hr']) {
            this.subscriptions.hr = state.subscribeEvent(props.deviceId ? props.deviceId+'hr' :'hr', (hr) => {
                this.plotter.__operator({
                    hr: hr.bpm,
                    hrv: hr.change
                });
            })
        }
        if(!props?.sensors || props?.sensors?.includes['imu']) {
            this.subscriptions.imu = state.subscribeEvent(props.deviceId ? props.deviceId+'imu' :'imu', (imu) => {
                this.plotter.__operator(imu);
            })
        }
        if(!props?.sensors || props?.sensors?.includes['breath']) {
            this.subscriptions.breath = state.subscribeEvent(props.deviceId ? props.deviceId+'breath' :'breath', (breath) => {
                this.plotter.__operator({
                    breath:breath.bpm,
                    brv:breath.change
                });
            })
        }
        if(!props?.sensors || props?.sensors?.includes['env']) {
            this.subscriptions.env = state.subscribeEvent(props.deviceId ? props.deviceId+'env' :'env', (env) => {
                this.plotter.__operator(env);
            })
        }
        
    }

    componentWillUnmount() {
        for(const key in this.subscriptions) {
            state.unsubscribeEvent(key, this.subscriptions[key]);
        }
    }

    render() {
        return (
            <div className='chartContainer' ref={ (ref) => {
                ref?.appendChild(this.canvas); 
                ref?.appendChild(this.overlay);
                /*this is an example of weird reactjs crap*/
            }}>
            </div>
        )
    }
}