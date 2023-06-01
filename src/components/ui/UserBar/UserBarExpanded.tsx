import React from 'react';
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/esm/Container';

let profilePic = './assets/Person.jpg';

export function UserBarExpanded() {
  return (
    <Container>
    <Card border="primary">
      <Card.Header>
        <Nav variant="tabs" defaultActiveKey="#first">
          <Nav.Item>
            <Nav.Link href="#first">User</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#link">Stats</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href="#alerts">
              Alerts
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card.Header>
      <Card.Body>
        <Card.Title>Joshua Brewster</Card.Title>
        <Card.Text>
        <img className="rounded-circle" width="50" alt="Josh" src={profilePic} />
         &nbsp; Notifications feed or any important data to be seen first.
        </Card.Text>
      </Card.Body>
    </Card>
    </Container>
  );
}