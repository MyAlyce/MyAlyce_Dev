import React from 'react'
import {sComponent} from './state.component'

import { WorkerInfo, WorkerRoute } from 'graphscript';
import { connectDevice, disconnectDevice } from '../scripts/device';

export class DeviceComponent extends sComponent {
    
    state = {
        deviceConnected:false,
        device:undefined as {
            workers: {
                streamworker: WorkerInfo;
            };
            device: any;
            options: any;
            disconnect: () => void;
            read: (command?: any) => any;
            write: (command?: any) => any;
            roots: {
                [key: string]: WorkerRoute;
            };
        } | undefined
    }

    render() {
        return (
            <div>
                { this.state.deviceConnected ? 
                    <button onClick={connectDevice}>Connect</button> :
                    <button onClick={disconnectDevice}>Disconnect</button>
                }
                <div>
                    Chart
                </div>
            </div>
        )
    }
}