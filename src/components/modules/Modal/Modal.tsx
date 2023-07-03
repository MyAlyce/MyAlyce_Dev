import React, { useState } from 'react'
import Button from 'react-bootstrap/Button';
import M from 'react-bootstrap/Modal';


export function PopupModal(props:{
    title?:any,
    body?:any,
    style?:React.CSSProperties,
    onClose?:Function,
    defaultShow?:boolean
}) {
    
    const [show, setShow] = useState(props.defaultShow ? props.defaultShow : false);
  
    const handleClose = () => setShow(false);
    //const handleShow = () => setShow(true);
        
    return (
        <M centered show={show} onHide={()=>{handleClose(); if(props.onClose) props.onClose();}} backdrop={false} style={props.style ? props.style : undefined}>
          <M.Header closeButton>
            {props.title && <M.Title>{props.title}</M.Title>}
          </M.Header>
          <M.Body>
            { props.body }
          </M.Body>
          <M.Footer>
            <Button variant="secondary" onClick={()=>{handleClose(); if(props.onClose) props.onClose();}}>
              Close
            </Button>
          </M.Footer>
        </M>
    )
        
      
    
}
    
