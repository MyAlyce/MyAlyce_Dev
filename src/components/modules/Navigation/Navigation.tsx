import React, { useState } from 'react';
import * as Icon from 'react-feather';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {state} from '../../../scripts/client'

export function Navigation (){
  const [expanded, setExpanded] = useState(false);
  
  //console.log(window.location.pathname)
    return (
        <>
        <Navbar bg="light" expand="md" expanded={expanded}>
        {/* <Container> */}
        <div style={{ padding: '0px 15px' }}>
          <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(expanded ? false : true)}  />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link className="svghover" onClick={()=>{state.setState({route:'/'}); setExpanded(false);}}>          
              <Icon.Home className="align-text-bottom" size={20} data-active-link={window.location.pathname === '/'}></Icon.Home>
              &nbsp;Home</Nav.Link>
              {/* <Nav.Link onClick={()=>{state.setState({route:'/peers'}); setExpanded(false);}}>
              <Icon.Phone className="align-text-bottom" size={20}></Icon.Phone>
              &nbsp;WebRTC</Nav.Link> */}
              <Nav.Link className="svghover" onClick={()=>{state.setState({route:'/recordings'}); setExpanded(false);}}>
              <Icon.Activity className="align-text-bottom" size={20} data-active-link={window.location.pathname === '/recordings'}></Icon.Activity>
              &nbsp;Recordings</Nav.Link>
              {/* <Nav.Link  onClick={()=>{state.setState({route:'/settings'}); setExpanded(false);}}> 
              <Icon.Settings className="align-text-bottom" size={20}></Icon.Settings>
              &nbsp;Settings</Nav.Link> */}
              {/* <Nav.Link  onClick={()=>{state.setState({route:'/dev'}); setExpanded(false);}}> 
              <Icon.Tool className="align-text-bottom" size={20}></Icon.Tool>
              &nbsp;Dev</Nav.Link> */}
            </Nav>
          </Navbar.Collapse>
        {/* </Container> */}
        </div>
      </Navbar>
    </>
    )
}