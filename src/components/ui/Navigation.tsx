import React from 'react';
import * as Icon from 'react-feather';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

export function Navigation (){
    return (
        <>
        <Navbar bg="light" expand="md">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/">          
              <Icon.Home className="align-text-bottom" size={20}></Icon.Home>
              &nbsp;Home</Nav.Link>
              <Nav.Link href="peers">
              <Icon.Phone className="align-text-bottom" size={20}></Icon.Phone>
              &nbsp;WebRTC</Nav.Link>
              <Nav.Link href="recordings">
              <Icon.Mic className="align-text-bottom" size={20}></Icon.Mic>
              &nbsp;Recordings</Nav.Link>
              <Nav.Link href="settings">
              <Icon.Settings className="align-text-bottom" size={20}></Icon.Settings>
              &nbsp;Settings</Nav.Link>
              <Icon.Tool className="align-text-bottom" size={20}></Icon.Tool>
              <NavDropdown title="Developer Tools" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
    )
}