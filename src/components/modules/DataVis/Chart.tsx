import React from 'react'
import {sComponent} from '../../state.component'

import { state } from '../../../scripts/client'//'../../../graphscript/index'//
import { WGLPlotter } from '../../../scripts/webglplot/plotter';

import { WebglLineProps } from 'webgl-plot-utils';

import { max3010xChartSettings } from 'device-decoder/src/devices/max30102';
import { mpu6050ChartSettings } from 'device-decoder/src/devices/mpu6050';
import { bme280ChartSettings } from 'device-decoder/src/devices/bme280'
import { ads131m08ChartSettings } from 'device-decoder/src/devices/ads131m08';
import { Widget } from '../../widgets/Widget';



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

    lines?:{[key:string]:WebglLineProps};
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[];
    streamId?:string;
    title?:string;

    width:any = '100%';
    height:any = '300px';


    constructor(props:{
        height?:number|string,
        width?:number|string
        lines?:{[key:string]:WebglLineProps},
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[],
        streamId?:string,
        title?:string
    }) {
        super(props as any);

        if(props.height) this.height = props.height;
        if(props.width) this.width = props.width;
        this.lines = props.lines;
        this.sensors = props.sensors;
        this.streamId = props.streamId;
        this.title = props.title;
        
    }

    componentDidMount = () => {
        
        this.canvas.className = 'chartMain'
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.backgroundColor = 'black';
        this.overlay.className = 'chartOverlay'
        this.overlay.width = 800;
        this.overlay.height = 600;
        this.overlay.style.width = '100%';
        this.overlay.style.height = '100%';
        this.overlay.style.transform = 'translateY(-100%)';

        let lines = this.lines ? this.lines : this.sensors ? {} : {
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

        if(this.sensors) {
            if(this.sensors.includes('emg')) {
                lines['0'] = ads131m08ChartSettings.lines?.['0'] as WebglLineProps,
                lines['1'] = ads131m08ChartSettings.lines?.['1'] as WebglLineProps,
                lines['2'] = ads131m08ChartSettings.lines?.['2'] as WebglLineProps,
                lines['3'] = ads131m08ChartSettings.lines?.['3'] as WebglLineProps,
                lines['4'] = ads131m08ChartSettings.lines?.['4'] as WebglLineProps
                for(const key in lines) {
                    lines[key].nSec = 5;
                }
            }
            if(this.sensors.includes('ecg')) {
                lines['5'] = ads131m08ChartSettings.lines?.['5'] as WebglLineProps //ECG
                lines['5'].nSec = 5;
            }
            if(this.sensors.includes('ppg')) {
                lines['red'] = (max3010xChartSettings.lines as any).red;
                lines['ir'] = (max3010xChartSettings.lines as any).ir;
            }
            if(this.sensors.includes('hr')) {
                Object.assign(lines,{
                    hr: { sps: 1, nSec: 100, units: 'bpm' },
                    hrv: { sps: 1, nSec: 100, units: 'bpm' }
                })
            }
            if(this.sensors.includes('imu')) {
                Object.assign(lines,{
                    ...mpu6050ChartSettings.lines
                })
                delete (lines as any).mpu_dietemp;
            }
            if(this.sensors.includes('breath')) {
                Object.assign(lines,{
                    breath: { sps: 1, nSec: 100, units: 'bpm' },
                    brv: { sps: 1, nSec: 100, units: 'bpm' }
                })
            }
            if(this.sensors.includes('env')) {
                Object.assign(lines,{
                    ...bme280ChartSettings.lines
                })
            }
        }

        //console.log('making chart with lines', lines);

        //we are appending the canvas and overlay this way so they only need to be transferred once to the plotter thread 
        this.plotter = new WGLPlotter({
            _id:'abc',
            canvas:this.canvas,
            overlay:this.overlay,
            lines, //will render all lines unless specified
            generateNewLines:false,
            cleanGeneration:false,
            worker:true,
            mode:  (this.sensors?.includes('hr') ||  this.sensors?.includes('breath')) ? undefined : 'sweep',
            sweepColor:'green'
        });

        if(!this.sensors || (this.sensors?.includes('emg'))) {
            this.subscriptions.emg = state.subscribeEvent(this.streamId ? this.streamId+'emg' : 'emg', (data) => {
                this.plotter.__operator(data);
            });
        }
        if(!this.sensors || this.sensors?.includes('ecg')) {
            this.subscriptions.emg = state.subscribeEvent(this.streamId ? this.streamId+'ecg' : 'ecg', (data) => {
                this.plotter.__operator(data);
            });
        }
        if(!this.sensors || this.sensors?.includes('ppg')) {
            this.subscriptions.ppg = state.subscribeEvent(this.streamId ? this.streamId+'ppg' :'ppg', (ppg) => {
                this.plotter.__operator(ppg);
            });
        }
        if(!this.sensors || this.sensors?.includes('hr')) {
            this.subscriptions.hr = state.subscribeEvent(this.streamId ? this.streamId+'hr' :'hr', (hr) => {
                this.plotter.__operator(hr);
            });
        }
        if(!this.sensors || this.sensors?.includes('breath')) {
            this.subscriptions.breath = state.subscribeEvent(this.streamId ? this.streamId+'breath' :'breath', (breath) => {
                this.plotter.__operator(breath);
            });
        }
        if(!this.sensors || this.sensors?.includes('imu')) {
            this.subscriptions.imu = state.subscribeEvent(this.streamId ? this.streamId+'imu' :'imu', (imu) => {
                this.plotter.__operator(imu);
            });
        }
        if(!this.sensors || this.sensors?.includes('env')) {
            this.subscriptions.env = state.subscribeEvent(this.streamId ? this.streamId+'env' :'env', (env) => {
                this.plotter.__operator(env);
            });
        }
        
    }

    componentWillUnmount = () => {
        for(const key in this.subscriptions) {
            state.unsubscribeEvent(this.streamId ? this.streamId+key : key, this.subscriptions[key]);
        }
        (this.plotter.options.worker as Worker)?.terminate();
        //console.log('unmounted',this.plotter.options)
    }
    
    render() {

        let content = (
            <div>
                <div>
                    <div ref={ (ref) => {
                        ref?.appendChild(this.canvas); 
                        ref?.appendChild(this.overlay);
                        /*this is an example of weird reactjs crap*/
                    }}  style={ { height:this.height, width:this.width, maxHeight:this.height, minHeight:this.height, overflow:'hidden' }}>
                </div>
                </div>
            </div>
        );

        return (
            <Widget
                title={this.title}
                content={content}
            />
        )
    }
}