import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import * as Icon from 'react-feather';
import { NoteForm } from './Noteform';

export function Notes() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="accent1" onClick={handleShow}><Icon.Heart className="align-text-bottom" size={20}></Icon.Heart>
      &nbsp;Vitals
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><Icon.Heart className="align-text-bottom" color="red" size={26}></Icon.Heart>&nbsp;Vitals</Modal.Title>
        </Modal.Header>
        <Modal.Body>Please elaborate.
            <NoteForm />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="accent1" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}