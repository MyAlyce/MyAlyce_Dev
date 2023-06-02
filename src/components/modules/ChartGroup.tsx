import React, {Component}  from 'react'


import { Chart } from './Chart';
import { SensorDefaults, Sensors, state } from '../../scripts/client';
import { StreamToggle } from './StreamToggle';



export class ChartGroup extends Component<{
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[],
    streamId?:string
}> {
    
    state = { //synced with global state
        activeStream:undefined
    }

    activeCharts = {};
    unmounted?=true;

    constructor(props:{
        sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[],
        streamId?:string
    }) {
        super(props as any);
    }

    componentDidMount(): void {
        this.unmounted = false;
        this.constructCharts(this.props.streamId, this.props.sensors);
    }

    componentWillUnmount(): void {
        this.unmounted = true;
        this.activeCharts = {};
    }

    constructCharts(streamId?:string, sensors?:Sensors[]) { //('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[]
        if(!this.activeCharts['emg'] && (!sensors || sensors.includes('emg'))) {
            let makeChart = () => {
                this.activeCharts['emg'] = <Chart sensors={['emg']} streamId={streamId} title={"EMG"} key='emg'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})}); //this call fired repeatedly will only fire once on the next frame
            }
            if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeChart);
        } 
        if (!this.activeCharts['ecg'] && (!sensors || sensors.includes('ecg'))) {
            let makeChart = () => {
                this.activeCharts['ecg'] = <Chart sensors={['ecg']} streamId={streamId} title={"ECG"} key='ecg'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})}); //this call fired repeatedly will only fire once on the next frame
            }
            if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeChart);
        }
        if(!this.activeCharts['ppg'] && (!sensors || sensors.includes('ppg'))) {
            let makeChart = () => {
                this.activeCharts['ppg'] = <Chart sensors={['ppg']} streamId={streamId} title={"Pulse Oximeter"} key='ppg'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!this.activeCharts['hr'] && (!sensors || sensors.includes('hr'))) {
            let makeChart = () => {
                this.activeCharts['hr'] = <Chart sensors={['hr']} streamId={streamId} title={"Heart Rate & HRV"} key='hr'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!this.activeCharts['breath'] && (!sensors || sensors.includes('breath'))) {
            let makeChart = () => {
                this.activeCharts['breath'] = <Chart sensors={['breath']} streamId={streamId} title={"Breathing"} key='br'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})}); 
            }
            if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeChart);
        }
        if(!this.activeCharts['imu'] && (!sensors || sensors.includes('imu'))) {
            let makeChart = () => {
                this.activeCharts['imu'] = <Chart sensors={['imu']} streamId={streamId} title={"Accelerometer"} key='imu'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedIMU' : 'detectedIMU']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedIMU' : 'detectedIMU', makeChart);
        }
        if(!this.activeCharts['env'] && (!sensors || sensors.includes('env'))) {
            let makeChart = () => {
                this.activeCharts['env'] = <Chart sensors={['env']} streamId={streamId} title={"Environment"} key='env'/>;
                if(!this.unmounted) requestAnimationFrame(()=>{this.setState({})});
            }
            if(state.data[streamId ? streamId+'detectedENV' : 'detectedENV']) {
                makeChart();
            } else state.subscribeEventOnce(streamId ? streamId+'detectedENV' : 'detectedENV', makeChart);
        }
    }

    unsubscribeCharts(sensors?:Sensors[]) { //('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[]
        
    }

    render() {
        return (
            <div>
                <StreamToggle
                    toggled={this.props.sensors}
                    subscribable={[...SensorDefaults]}
                    onChange={(ev) => {
                        if(ev.checked) {
                            this.constructCharts(this.props.streamId, [ev.key as any]);
                            this.setState({});
                        } else {
                            delete this.activeCharts[ev.key];
                            this.setState({});
                        }
                    }}
                    onlyOneActive={true}
                />
                <div>{
                    Object.keys(this.activeCharts).map((v) => {
                        return this.activeCharts[v];
                    })
                }</div>
            </div>
        )
    }
}