import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as Icon from 'react-feather';
import { NoteForm } from './Noteform';
import { SettingsView } from '../pages/SettingsView';

export function FriendsModal() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Icon.User onClick={handleShow} className="align-text-bottom" color="white" size={30}></Icon.User>
      <Modal show={show} onHide={handleClose} size="sm" backdrop={false}>
        <Modal.Header closeButton>
          <Modal.Title><Icon.User className="align-text-bottom" color="red" size={26}></Icon.User>&nbsp;Friends List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <SettingsView />
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