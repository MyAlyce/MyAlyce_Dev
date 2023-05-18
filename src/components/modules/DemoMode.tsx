import React, {Component} from 'react'
import { sComponent } from '../state.component';
import { demoFile, demos } from '../../scripts/datacsv';

export class Demo extends sComponent {

    state = {
        demos,
        demoing:false
    }

    constructor(props) {
        super(props);   
        this.state.demos = demos;
    }

    startDemos(sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[]) {
        if(!sensors) {
            sensors = ['emg','ppg','breath','hr','imu','env','ecg'];
        }
        
        let detected = {} as any;
        for(const v of sensors) {
            demoFile(v);
            detected['detected'+v.toUpperCase()] = true;
        }

        this.setState({deviceConnected:true, demoing:true, ...detected});
    }

    stopDemos() {

        let detected = {} as any;
        for(const key in this.state.demos) {
            this.state.demos[key].running = false;
            detected['detected'+key.toUpperCase()] = true;
        }
        this.setState({deviceConnected:false, demoing:false, ...detected});
    }

    render() {

        let demoonclick = () => {
            this.startDemos(); //todo add device selection
        }

        let stopdemoonclick = () => {
            this.stopDemos();
        }

        return (
            <div>
                { !this.state.demoing ? 
                    <button onClick={demoonclick}>Demo Data</button>
                :   <button onClick={stopdemoonclick}>Stop Demo</button>
                }
            </div>
        );
    }

}