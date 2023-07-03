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

  showing=false;
  streamId?:any;

  constructor(props:{streamId?:string, hideIcon?:boolean, hideModal?:boolean, useActiveStream?:boolean}) {
    super(props);
    if(!this.props.hideModal) console.log('constructing', this.streamId);
  }

  handleClose = () => {
    this.showing = false; this.setState({});
  };

  handleShow = () => {
    console.log('handle show', this, this.streamId, this.props.hideModal);
    this.showing = true; 
    this.setState({});
  };

  componentDidMount = () => {
    if(this.streamId && this.props.streamId) this.streamId = this.props.streamId;
    if(!this.props.hideModal) {
      if(this.props.useActiveStream) {
        this.__subscribeComponent(
          'activeStream', 
          (streamId) => {
            console.log('new active stream', streamId, this);
            this.__unsubscribeComponent(this.streamId ? this.streamId+'alert' : 'alert');
            this.streamId = streamId;
            this.__subscribeComponent(
              this.streamId ? this.streamId+'alert' : 'alert', 
              (v) => {
                console.log('alert received by modal for',this.streamId);
                this.handleShow();
              }
            );
          }
        );
      } else {
        this.__subscribeComponent(
          this.streamId ? this.streamId+'alert' : 'alert', 
          (value) => {
            console.log('alert received by modal for', this.streamId);
            this.handleShow();
          }
        );
      }
    }
  }

  componentWillUnmount(): void {
    if(!this.props.hideModal) {
      this.__unsubscribeComponent(
        this.streamId ? this.streamId+'alert' : 'alert'
      );
      console.log('unmounting', this.streamId);
      if(this.props.useActiveStream) {
        this.__unsubscribeComponent('activeStream');
      }
    }

  }

  render() {
  
    let result = checkForAlerts(this.streamId);

    console.log(result);

    let len = result?.alerts?.length;

    //console.log(result.alerts);

    if(!this.props.hideModal) console.log('rendering', this.streamId);

    return (
        <>
        {this.props.hideIcon ? null : 
          <span onClick={this.props.hideModal ? undefined : this.handleShow}>
            {len ? <Badge className="wiggletext" style={{ padding:'4px', position:'absolute'}} bg="danger">{len}</Badge> : null }
            <Icon.Bell style={{cursor:'pointer'}}  className="svghover align-text-bottom" size={40}></Icon.Bell>
          </span>
        }
     
      { !this.props.hideModal && 
        <Modal centered show={this.showing} onHide={this.handleClose} backdrop={false}>
            <Modal.Header closeButton>
              <Modal.Title style={{position:'relative'}}><BeatingSVG customContent={<Icon.AlertTriangle size={26} color={'red'}/>}/>&nbsp;</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className='mx-auto'> 
                <strong>Alerts for { this.streamId ? 
                  webrtcData.availableStreams[this.streamId].firstName + ' ' + webrtcData.availableStreams[this.streamId].lastName : 
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
                          result?.alerts.splice(i,1);
                          this.setState({}); //remove old alerts
                        }}>❌</button>
                    </div>
                )
              }) : null }
              </div>
              <Button onClick={()=>{ throwAlert({message:"This is an Alert", value:undefined, timestamp:Date.now()}, this.streamId, true) }}>Test Alert</Button>
            </Modal.Body>
            <Modal.Footer>
              
              <Button variant="secondary" onClick={this.handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal> }
      </>
    );
  }

}
