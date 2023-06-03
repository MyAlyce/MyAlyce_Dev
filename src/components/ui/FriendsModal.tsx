import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as Icon from 'react-feather';
import { UserAuths } from '../modules/UserAuths';
import { StartCall } from '../modules/WebRTC/Calling';
import { client } from '../../scripts/client';

export function FriendsModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Icon.User onClick={handleShow} className="align-text-bottom" color="white" size={30}></Icon.User>
      <Modal show={show} onHide={handleClose} backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title><Icon.User className="align-text-bottom" color="red" size={26}></Icon.User>&nbsp;My Connections</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserAuths/>
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