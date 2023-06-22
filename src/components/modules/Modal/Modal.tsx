import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';


export function PopupModal(props:{
    title?:any,
    body?:any,
    style?:React.CSSProperties,
    onClose?:Function
}) {
    
    const [show, setShow] = useState(true);
  
    const handleClose = () => setShow(false);
    //const handleShow = () => setShow(true);
        
    return (
        <Modal centered show={show} onHide={handleClose} backdrop={false} style={props.style ? props.style : undefined}>
          <Modal.Header closeButton>
            {props.title && <Modal.Title>{props.title}</Modal.Title>}
          </Modal.Header>
          <Modal.Body>
            { props.body }
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={()=>{handleClose(); if(props.onClose) props.onClose();}}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
    )
        
      
    
}
    
