import React from "react";
import { brworker, characteristicCallbacks, connectDevice, 
    disconnectDevice, hrworker, serviceCharacteristic, setupBRWorker, 
    setupHRWorker, terminateBRWorker, terminateHRWorker } from "../../../scripts/device";
import { Button } from "react-bootstrap";
import { sComponent } from "../../state.component";
import {SensorDefaults, Sensors, client, state} from '../../../scripts/client'
import { stopdemos } from "../../../scripts/demo";
import { StreamToggle } from "../Streams/StreamToggle";

import {device} from '../../../scripts/device'
import { Widget } from "../../widgets/Widget";
import { Col } from "react-bootstrap";

import * as Icon from 'react-feather'

import { CallSelf } from "../WebRTC/Calling";

export class DeviceConnect extends sComponent {

    state = { //synced with global state
        deviceConnected:false,
        unansweredCalls:undefined
    }

    sensors=['ppg','breath','hr','imu','env'] as Sensors[];

    //check for personal call
    
    render() {

        return (      
            <Widget
                className={"mx-auto"}
                content={
                    <Col className="mx-auto">   
                        <span className="mx-auto">
                        { !this.state.deviceConnected ? 
                            
                            <Col>
                                <Button onClick={()=>{
                                    if(state.data.demoing) {
                                        stopdemos();
                                    }
                                    connectDevice(this.sensors);
                                }}><Icon.Bluetooth/></Button>
                            </Col> :
                            <>
                                <Col>
                                    <Button onClick={()=>{
                                        if(state.data.demoing) {
                                            stopdemos();
                                        } else disconnectDevice();
                                    }}><Icon.XCircle/></Button>
                                </Col>
                                {/** Toggles for sensor subscriptions */}
                                <Col>
                                    <StreamToggle
                                        toggled={this.sensors}
                                        subscribable={[...SensorDefaults]}
                                        onChange={(ev) => {
                                            if(ev.checked) {
                                                if(device && characteristicCallbacks[ev.key]) {
                                                    device.subscribe(serviceCharacteristic, characteristicCallbacks[ev.key].characteristic, characteristicCallbacks[ev.key].callback);
                                                } else if (!hrworker && ev.key === 'hr') {
                                                    setupHRWorker();
                                                } else if (!brworker && ev.key === 'breath') {
                                                    setupBRWorker();
                                                }
                                                this.setState({});
                                            } else {
                                                if(device && characteristicCallbacks[ev.key]) {
                                                    device.unsubscribe(serviceCharacteristic, characteristicCallbacks[ev.key].characteristic);
                                                } else if (ev.key === 'hr') {
                                                    terminateHRWorker();
                                                } else if (ev.key === 'breath') {
                                                    terminateBRWorker();
                                                }
                                                this.setState({});
                                            }
                                        }}
                                        // onlyOneActive={true}
                                    />  
                                </Col>
                                <Col>
                                    <CallSelf/>  
                                </Col>
                            </>
                        } 
                        </span>
                    </Col>
                }
            />      
        );
        
    }
}