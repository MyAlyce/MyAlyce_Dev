import React from "react";
import { connectDevice, disconnectDevice } from "../../scripts/device";
import { Button } from "../lib/src";
import { sComponent } from "../state.component";


export class DeviceConnect extends sComponent {

    state = { //synced with global state
        deviceConnected:false
    }
    
    render() {
        return (                    
            <div>
            { !this.state.deviceConnected ? 
                <Button onClick={()=>{connectDevice('other');}}>Connect</Button> :
                <Button onClick={()=>{disconnectDevice();}}>Disconnect</Button>
            } 
            </div>
        );
        
    }
}