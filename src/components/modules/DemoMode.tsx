import React, {Component} from 'react'
import { sComponent } from '../state.component';
import { demo, demoFile, demos, stopdemos } from '../../scripts/demo';
import {Sensors, state} from '../../scripts/client'
import { disconnectDevice } from '../../scripts/device';

export class Demo extends sComponent {

    state = {
        demos,
        demoing:false
    }

    constructor(props) {
        super(props);   
        this.state.demos = demos;
    }

    startDemos(sensors?:Sensors[]) { //('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[]
        demo(sensors);
    }

    stopDemos() {
        stopdemos();
    }

    render() {

        let demoonclick = () => {
            this.startDemos(); //todo add device selection
        }

        let stopdemoonclick = () => {
            if(state.data.deviceConnected) {
                disconnectDevice();
            }
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