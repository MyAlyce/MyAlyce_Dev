import React from "react";
import { connectDevice, disconnectDevice } from "../scripts/device";
import { sComponent } from "./state.component";


export class DeviceConnect extends sComponent {

    state = { //synced with global state
        deviceConnected:false
    }
    
    render() {

        console.log(this.state.deviceConnected)
        return (                    
            <div>
            { !this.state.deviceConnected ? 
                <button onClick={connectDevice}>Connect</button> :
                <button onClick={disconnectDevice}>Disconnect</button>
            } 
            </div>
        );
        
    }
}