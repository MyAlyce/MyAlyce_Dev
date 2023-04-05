import React from 'react'
import {sComponent} from './state.component'


import { DeviceConnect } from './DeviceConnect';
import { Chart } from './Chart';
import { StreamSelect } from './StreamSelect';
import { state } from 'graphscript';



export class ChartGroup extends sComponent {
    
    state = { //synced with global state
        activeStream:undefined
    }

    activeCharts = {};
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[];

    constructor(props:{
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],
        streamId?:string
    }) {
        super(props as any);

        if(props.sensors) this.sensors = props.sensors;
        this.constructCharts(props.streamId, props.sensors);
    }

    constructCharts(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[]) {

        if(!sensors || sensors?.includes('emg')) {
            let makeChart = () => {
                this.activeCharts['emg'] = <Chart sensors={['emg']} streamId={streamId}/>;
                requestAnimationFrame(this.render); //this call fired repeatedly will only fire once on the next frame
            }
            if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
                makeChart();
            } else state.subscribeEvent(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeChart);
            
        }
        if(!sensors || sensors?.includes('ppg')) {
            let makeChart = () => {
                this.activeCharts['ppg'] = <Chart sensors={['ppg']} streamId={streamId}/>;
                requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEvent(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('hr')) {
            let makeChart = () => {
                this.activeCharts['hr'] = <Chart sensors={['hr']} streamId={streamId}/>;
                requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEvent(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('imu')) {
            let makeChart = () => {
                this.activeCharts['imu'] = <Chart sensors={['env']} streamId={streamId}/>;
                requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedIMU' : 'detectedIMU']) {
                makeChart();
            } else state.subscribeEvent(streamId ? streamId+'detectedIMU' : 'detectedIMU', makeChart);
              
        }
        if(!sensors || sensors?.includes('breath')) {
            let makeChart = () => {
                this.activeCharts['imu'] = <Chart sensors={['env']} streamId={streamId} />;
                requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEvent(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('env')) {
            let makeChart = () => {
                this.activeCharts['env'] = <Chart sensors={['env']} streamId={streamId}/>;
                requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedENV' : 'detectedENV']) {
                makeChart();
            } else state.subscribeEvent(streamId ? streamId+'detectedENV' : 'detectedENV', makeChart);
            
        }
    }

    render() {
        return (
            <div>
                <div>
                    <StreamSelect/>
                </div>
                <div>{
                    Object.keys(this.activeCharts).map((v) => {
                        return this.activeCharts[v];
                    })
                }</div>
            </div>
        )
    }
}