import React, {Component} from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as Icon from 'react-feather';


import { UserAuths } from './UserAuths';
import { Badge } from 'react-bootstrap';
import { client } from '../../../scripts/client';

export class FriendsModal extends Component {
  

  checkLoop:any; 

  state={
    authRequests:[] as any,
    show:false
  }

  componentDidMount(): void {
    let checkRequests = async () => {
      this.state.authRequests = await client.getData('authRequest', undefined, {receiving: client.currentUser._id});
      this.setState({});
      this.checkLoop = setTimeout(()=>{checkRequests();}, 10000); //let's check for requests
    }
  }

  componentWillUnmount(): void {
    if(this.checkLoop) clearTimeout(this.checkLoop);
  }

  handleClose = () => {
    this.setState({show:false});
  };

  handleShow = () => {
    this.setState({show:true});
  };
  

  render() {

    return (
      <>
        <span>
          {this.state.authRequests?.length > 0 ? <Badge className="wiggletext" style={{padding:'4px', position:'absolute'}} bg="primary">{this.state.authRequests.length}</Badge> : null}
          <Icon.User style={{cursor:'pointer', padding:'5px'}} onClick={this.handleShow} className="svghover hoverdiv align-text-bottom" color="white" size={50}></Icon.User>
        </span>
        <Modal centered show={this.state.show} onHide={this.handleClose} backdrop={false}>
          <Modal.Header closeButton>
            <Modal.Title><Icon.User className="align-text-bottom" color="red" size={26}></Icon.User>&nbsp;My Connections</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <UserAuths/>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
  
  
}