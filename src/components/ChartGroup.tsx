import React from 'react'
import {sComponent} from './state.component'


import { Chart } from './Chart';
import { state } from '../scripts/client';



export class ChartGroup extends sComponent {
    
    state = { //synced with global state
        activeStream:undefined
    }

    activeCharts = {};
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[];
    unmounted?=true;

    constructor(props:{
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],
        streamId?:string
    }) {
        super(props as any);

        if(props.sensors) this.sensors = props.sensors;
        this.constructCharts(props.streamId, props.sensors);
    }

    componentDidMount(): void {
        this.unmounted = false;
    }

    componentWillUnmount(): void {
        this.unmounted = true;
    }

    constructCharts(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[]) {

        if(!sensors || sensors?.includes('emg')) {
            let makeChart = () => {
                this.activeCharts['emg'] = <Chart sensors={['emg']} streamId={streamId} title={"EMG & ECG"}/>;
                if(!this.unmounted) requestAnimationFrame(this.render); //this call fired repeatedly will only fire once on the next frame
            }
            if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeChart);
            
        }
        if(!sensors || sensors?.includes('ppg')) {
            let makeChart = () => {
                this.activeCharts['ppg'] = <Chart sensors={['ppg']} streamId={streamId} title={"Pulse Oximeter"}/>;
                if(!this.unmounted) requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('hr')) {
            let makeChart = () => {
                this.activeCharts['hr'] = <Chart sensors={['hr']} streamId={streamId} title={"Heart Rate & HRV"}/>;
                if(!this.unmounted) requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('imu')) {
            let makeChart = () => {
                this.activeCharts['imu'] = <Chart sensors={['imu']} streamId={streamId} title={"Accelerometer"}/>;
                if(!this.unmounted) requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedIMU' : 'detectedIMU']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedIMU' : 'detectedIMU', makeChart);
              
        }
        if(!sensors || sensors?.includes('breath')) {
            let makeChart = () => {
                this.activeCharts['breath'] = <Chart sensors={['breath']} streamId={streamId} title={"Breathing"}/>;
                if(!this.unmounted) requestAnimationFrame(this.render); 
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('env')) {
            let makeChart = () => {
                this.activeCharts['env'] = <Chart sensors={['env']} streamId={streamId} title={"Environment"}/>;
                if(!this.unmounted) requestAnimationFrame(this.render);
            }
            if(state.data[streamId ? streamId+'detectedENV' : 'detectedENV']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedENV' : 'detectedENV', makeChart);
            
        }
    }

    render() {
        return (
            <div>
                <div>{
                    Object.keys(this.activeCharts).map((v) => {
                        return this.activeCharts[v];
                    })
                }</div>
            </div>
        )
    }
}