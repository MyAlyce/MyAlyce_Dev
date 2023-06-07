import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';
import { alerts, client, splitCamelCase, webrtc, webrtcData } from '../../../scripts/client';
import { sComponent } from '../../state.component';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import { toISOLocal } from 'graphscript-services.storage';
import { checkForAlerts, throwAlert } from '../../../scripts/alerts';
import { BeatingSVG } from '../../svg/BeatingSVG/BeatingSVG';

export class UserAlerts extends sComponent {

  constructor(props:{streamId?:string, hideIcon?:boolean}) {
    super(props);
  }

  componentDidMount(): void {
    this.__subscribeComponent(this.props.streamId ? this.props.streamId+'alert' : 'alert', (value) => {
      this.show = true;
      this.setState({});
    });
  }

  componentWillUnmount(): void {
    this.__unsubscribeComponent(this.props.streamId ? this.props.streamId+'alert' : 'alert');
  }

  show=false;
  render() {
  
    const handleClose = () => {this.show = false; this.setState({});};
    const handleShow = () => {this.show = true; this.setState({});};
  
    let result = checkForAlerts(this.props.streamId);

    let len = result?.alerts?.length;

    return (
        <>
        {this.props.hideIcon ? null : 
          <span onClick={handleShow}>
            {len ? <Badge className="wiggletext" style={{ padding:'4px', position:'absolute'}} bg="danger">{len}</Badge> : null }
            <Icon.Bell style={{cursor:'pointer'}}  className="svghover align-text-bottom" size={40}></Icon.Bell>
          </span>
        }
     
        <Modal show={this.show} onHide={handleClose} backdrop={false} style={{maxHeight:'500px'}}>
          <Modal.Header closeButton>
            <Modal.Title style={{position:'relative'}}><BeatingSVG customContent={<Icon.AlertTriangle size={26} color={'red'}/>}/>&nbsp;</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className='mx-auto'> 
              <strong>Alerts for { this.props?.streamId ? webrtcData.availableStreams[this.props.streamId].firstName + ' ' + webrtcData.availableStreams[this.props.streamId].lastName : client.currentUser.firstName + ' ' + client.currentUser.lastName }</strong>
            { result?.alerts ? [...result.alerts].reverse().map((v, i) => { 
              return (
                  <div key={i} className={"alert-message"}>
                      <div className="top-info">
                          <p><strong>Time:</strong> {new Date(v.timestamp).toLocaleTimeString()}</p>
                          <p><strong>From:</strong> {splitCamelCase(v.from)}</p>
                      </div>
                      <p><strong>Value:</strong> {typeof v.value === 'number' ? v.value.toFixed(3) : v.value}</p>
                      <p><strong>Message:</strong> {v.message}</p>
                      <button onClick={()=>{
                        result.alerts.splice(i,1);
                        this.setState({}); //remove old alerts
                      }}>❌</button>
                  </div>
              )
            }) : null }
            </div>
            <Button onClick={()=>{ throwAlert({message:"This is an Alert", value:undefined, timestamp:Date.now()}) }}>Test Alert</Button>
          </Modal.Body>
          <Modal.Footer>
            
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

}
