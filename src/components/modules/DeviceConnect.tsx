import React from "react";
import { connectDevice, disconnectDevice } from "../../scripts/device";
import { Button } from "../lib/src";
import { sComponent } from "../state.component";
import {state} from '../../scripts/client'
import { stopdemos } from "../../scripts/demo";


export class DeviceConnect extends sComponent {

    state = { //synced with global state
        deviceConnected:false
    }
    
    render() {
        return (                    
            <div>
            { !this.state.deviceConnected ? 
                <Button onClick={()=>{
                    if(state.data.demoing) {
                        stopdemos();
                    }
                    connectDevice('other');
                }}>Connect</Button> :
                <Button onClick={()=>{
                    if(state.data.demoing) {
                        stopdemos();
                    } else disconnectDevice();
                }}>Disconnect</Button>
            } 
            </div>
        );
        
    }
}