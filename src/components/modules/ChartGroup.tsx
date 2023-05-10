import React, {Component}  from 'react'


import { Chart } from './Chart';
import { state } from '../../scripts/client';



export class ChartGroup extends Component<{[key:string]:any}> {
    
    state = { //synced with global state
        activeStream:undefined
    }

    activeCharts = {};
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[];
    unmounted?=true;
    streamId?:string;

    constructor(props:{
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],
        streamId?:string
    }) {
        super(props as any);

        this.sensors = props.sensors;
        this.streamId = props.streamId;
    }

    componentDidMount(): void {
        this.unmounted = false;
        this.constructCharts(this.streamId, this.sensors);
    }

    componentWillUnmount(): void {
        this.unmounted = true;
    }

    constructCharts(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[]) {
        if(!sensors || sensors?.includes('emg')) {
            let makeChart = () => {
                this.activeCharts['emg'] = <Chart sensors={['emg']} streamId={streamId} title={"EMG & ECG"} key='emg'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})}); //this call fired repeatedly will only fire once on the next frame
            }
            if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeChart);
            
        }
        if(!sensors || sensors?.includes('ppg')) {
            let makeChart = () => {
                this.activeCharts['ppg'] = <Chart sensors={['ppg']} streamId={streamId} title={"Pulse Oximeter"} key='ppg'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('hr')) {
            let makeChart = () => {
                this.activeCharts['hr'] = <Chart sensors={['hr']} streamId={streamId} title={"Heart Rate & HRV"} key='hr'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('imu')) {
            let makeChart = () => {
                this.activeCharts['imu'] = <Chart sensors={['imu']} streamId={streamId} title={"Accelerometer"} key='imu'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedIMU' : 'detectedIMU']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedIMU' : 'detectedIMU', makeChart);
              
        }
        if(!sensors || sensors?.includes('breath')) {
            let makeChart = () => {
                this.activeCharts['breath'] = <Chart sensors={['breath']} streamId={streamId} title={"Breathing"} key='br'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})}); 
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!sensors || sensors?.includes('env')) {
            let makeChart = () => {
                this.activeCharts['env'] = <Chart sensors={['env']} streamId={streamId} title={"Environment"} key='env'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedENV' : 'detectedENV']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedENV' : 'detectedENV', makeChart);
            
        }
    }

    unsubscribeCharts() {

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