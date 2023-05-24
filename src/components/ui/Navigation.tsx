import React from 'react';
import * as Icon from 'react-feather';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import {state} from '../../scripts/client'

export function Navigation (){
    return (
        <>
        <Navbar bg="light" expand="md">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={()=>{state.setState({route:'/'})}}>          
              <Icon.Home className="align-text-bottom" size={20}></Icon.Home>
              &nbsp;Home</Nav.Link>
              <Nav.Link onClick={()=>{state.setState({route:'/peers'})}}>
              <Icon.Phone className="align-text-bottom" size={20}></Icon.Phone>
              &nbsp;WebRTC</Nav.Link>
              <Nav.Link onClick={()=>{state.setState({route:'/recordings'})}}>
              <Icon.Activity className="align-text-bottom" size={20}></Icon.Activity>
              &nbsp;Recordings</Nav.Link>
              <Nav.Link  onClick={()=>{state.setState({route:'/settings'})}}> 
              <Icon.Settings className="align-text-bottom" size={20}></Icon.Settings>
              &nbsp;Settings</Nav.Link>
              <Nav.Link  onClick={()=>{state.setState({route:'/dev'})}}> 
              <Icon.Tool className="align-text-bottom" size={20}></Icon.Tool>
              &nbsp;Dev</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
    )
}