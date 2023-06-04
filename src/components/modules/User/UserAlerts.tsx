import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';
import { alerts, webrtc, webrtcData } from '../../../scripts/client';
import { sComponent } from '../../state.component';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import { toISOLocal } from 'graphscript-services.storage';

export class UserAlerts extends sComponent {

  constructor(props:{streamId?:string}) {
    super(props);
  }


  componentDidMount(): void {
    this.__subscribeComponent(this.props.streamId ? this.props.streamId+'alert' : 'alert');
  }

  componentWillUnmount(): void {
    this.__unsubscribeComponent(this.props.streamId ? this.props.streamId+'alert' : 'alert');
  }

  show=false;
  render() {
  
    const handleClose = () => {this.show = false; this.setState({});};
    const handleShow = () => {this.show = true; this.setState({});};
  
    let as = this.props?.streamId ? 
      webrtcData.availableStreams[this.props.streamId].alerts 
        : 
      alerts;

    let len = as?.length;

    return (
      <>
        <Icon.Bell style={{cursor:'pointer'}}  className="align-text-bottom" size={40} onClick={handleShow}></Icon.Bell>
        <Badge bg="danger">{len ? len : 0}</Badge>
        <Modal show={this.show} onHide={handleClose} backdrop={false} style={{maxHeight:'500px'}}>
          <Modal.Header closeButton>
            <Modal.Title><Icon.User className="align-text-bottom" color="red" size={26}></Icon.User>&nbsp;My Connections</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table> 
              <tbody>
                <Row><Col>Timestamp</Col><Col>Message</Col><Col>Value</Col><Col>From</Col></Row>
                { as?.map(v => <Row><Col>{toISOLocal(new Date(v.timestamp))}</Col><Col>{v.message}</Col><Col>{v.value}</Col><Col>{v.from}</Col></Row>)}
              </tbody>
            </Table>
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
