import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';
import { webrtc } from '../../../scripts/client';
import { RTCCallInfo } from '../../../scripts/webrtc';
import { sComponent } from '../../state.component';
import { Button, Modal } from 'react-bootstrap';
import { Messaging } from '../WebRTC/Calling';

export class UserMessages extends sComponent {

  constructor(props:{streamId?:string}) {
    super(props);
  }

  componentDidMount(): void {
    this.__subscribeComponent(this.props.streamId + 'message');
  }

  componentWillUnmount(): void {
    this.__unsubscribeComponent(this.props.streamId + 'message');
  }

  
  show=false;
  render() {
  
    const handleClose = () => {this.show = false; this.setState({});};
    const handleShow = () => {this.show = true; this.setState({});};
  
    let chats = (webrtc.rtc[this.props.streamId] as RTCCallInfo).messages;

    return (
      <>
        <Icon.MessageSquare style={{cursor:'pointer'}} className="align-text-bottom" size={40} onClick={handleShow}></Icon.MessageSquare>
        <Badge bg="secondary">{chats ? chats.length : 0}</Badge> {/** TODO: have a number for the number of unchecked messages */}
        <Modal show={this.show} onHide={handleClose} backdrop={false} style={{maxHeight:'500px'}}>
          <Modal.Header closeButton>
            <Modal.Title><Icon.User className="align-text-bottom" color="red" size={26}></Icon.User>&nbsp;My Connections</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Messaging
              streamId={this.props.streamId}
            />
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
