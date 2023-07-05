import React from 'react'
import { sComponent } from '../../state.component';
import { demo, demos, stopdemos } from '../../../scripts/demo';
import {Sensors, state} from '../../../scripts/client'
import { disconnectDevice } from '../../../scripts/device';
import { Button } from 'react-bootstrap';
import { Widget } from '../../widgets/Widget';

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
            state.setState({demoing:true});
        }

        let stopdemoonclick = () => {
            if(state.data.deviceConnected) {
                disconnectDevice();
            }
            this.stopDemos();
            state.setState({demoing:false});
        }

        return (
            <Widget
                content={<> 
                {!this.state.demoing ? 
                        <Button onClick={demoonclick}>Demo Data</Button>
                    :   <Button onClick={stopdemoonclick}>Stop Demo</Button>
                    }
                </>
                }
            />
        );
    }

}