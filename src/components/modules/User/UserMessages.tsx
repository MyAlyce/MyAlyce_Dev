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
  
    const handleClose = () => {
      this.show = false; this.setState({});
    };
    const handleShow = () => {
      (webrtc.rtc[this.props.streamId] as RTCCallInfo).unreadMessages = 0;
      this.show = true; this.setState({});

    };
  
    let chats = (webrtc.rtc[this.props.streamId] as RTCCallInfo).messages;
    let unread = (webrtc.rtc[this.props.streamId] as RTCCallInfo).unreadMessages;

    return (
      <>
        <span onClick={handleShow}>
          {unread ? <Badge className="wiggletext" style={{padding:'4px', position:'absolute'}} bg="success">{unread}</Badge> : null} 
          <Icon.MessageSquare style={{cursor:'pointer'}} className="svghover align-text-bottom" size={40}></Icon.MessageSquare>
        </span>
        {/** TODO: have a number for the number of unchecked messages */}
        <Modal centered show={this.show} onHide={handleClose} backdrop={false}>
          <Modal.Header closeButton>
            <Modal.Title><Icon.MessageSquare className="align-text-bottom" color="red" size={26}></Icon.MessageSquare>&nbsp;Messages</Modal.Title>
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
