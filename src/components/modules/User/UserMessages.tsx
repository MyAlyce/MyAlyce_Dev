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

  constructor(props:{streamId?:string, hideIcon?:boolean, hideModal?:boolean}) {
    super(props);
  }

  componentDidMount(): void {
    if(!this.props.hideModal) this.__subscribeComponent(this.props.streamId + 'message');
  }

  componentWillUnmount(): void {
    if(!this.props.hideModal) this.__unsubscribeComponent(this.props.streamId + 'message');
  }

  handleClose = () => {
    this.show = false; this.setState({});
  };
  
  handleShow = () => {
    (webrtc.rtc[this.props.streamId] as RTCCallInfo).unreadMessages = 0;
    this.show = true; this.setState({});
  };
  
  show=false;
  render() {
  
    let chats = (webrtc.rtc[this.props.streamId] as RTCCallInfo).messages;
    let unread = (webrtc.rtc[this.props.streamId] as RTCCallInfo).unreadMessages;

    return (
      <>
        {!this.props.hideIcon && 
          <span onClick={this.props.hideModal ? undefined : this.handleShow}>
            {unread ? <Badge className="wiggletext" style={{padding:'4px', position:'absolute'}} bg="success">{unread}</Badge> : null} 
            <Icon.MessageSquare style={{cursor:'pointer'}} className="svghover align-text-bottom" size={40}></Icon.MessageSquare>
          </span>
        }
        {/** TODO: have a number for the number of unchecked messages */}
        { !this.props.hideModal &&
          <Modal centered show={this.show} onHide={this.handleClose} backdrop={false}>
            <Modal.Header closeButton>
              <Modal.Title><Icon.MessageSquare className="align-text-bottom" color="red" size={26}></Icon.MessageSquare>&nbsp;Messages</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Messaging
                streamId={this.props.streamId}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        }
      </>
    );
  }

}
