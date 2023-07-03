import React, {Component} from "react";

import {StateModal} from '../State/StateModal'
import { client, splitCamelCase, webrtcData } from "../../../scripts/client";
import { Button } from "react-bootstrap";
import { checkForAlerts, throwAlert } from "../../../scripts/alerts";
import { BeatingSVG } from "../../svg/BeatingSVG/BeatingSVG";
import * as Icon from 'react-feather'


export class AlertModal extends Component<{streamId?:string}> {

    constructor(props) {
        super(props);
    }

    render() {

        let result = checkForAlerts(this.props.streamId);

        let len = result?.alerts?.length;

        return (<StateModal
            stateKey={this.props.streamId ? this.props.streamId+'alert' : 'alert'}
            title={<><BeatingSVG customContent={<Icon.AlertTriangle size={26} color={'red'}/>}/>&nbsp;</>}
            body={<>
                <div className='mx-auto'> 
                <strong>Alerts for { 
                    this.props?.streamId ? 
                    webrtcData.availableStreams[this.props.streamId].firstName + ' ' + webrtcData.availableStreams[this.props.streamId].lastName 
                        : 
                    client.currentUser.firstName + ' ' + client.currentUser.lastName }</strong>
                { result?.alerts ? [...result.alerts].reverse().map((v, i) => { 
                    return (
                        <div key={i} className={"alert-message"}>
                            <div className="top-info">
                                <p><strong>Time:</strong> {new Date(v.timestamp).toLocaleTimeString()}</p>
                                <p><strong>From:</strong> {splitCamelCase(v.from)}</p>
                            </div>
                            { v.value !== undefined && <p><strong>Value:</strong> {typeof v.value === 'number' ? v.value.toFixed(3) : v.value}</p> }
                            <p><strong>Message:</strong> {v.message}</p>
                            <button onClick={()=>{
                            console.log('onclick');
                            result?.alerts.splice(i,1);
                            this.setState({}); //remove old alerts
                            }}>❌</button>
                        </div>
                    )
                }) : null }
              </div>
              <Button onClick={()=>{ throwAlert({message:"This is an Alert", value:undefined, timestamp:Date.now()}, this.props.streamId, true) }}>Test Alert</Button>
              </>
            }
        
        />)
    }
}