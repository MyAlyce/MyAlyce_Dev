import React from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { UserLogin } from '../ui/UserLogin.tsx';
import { UserFeed } from '../ui/UserFeed.tsx';
import { Notify } from '../ui/Notify.tsx';
let profilePic = './assets/JoshBrew.jpg';
let profilePic2 = './assets/Alex-Shohet.jpg';
let profilePic3 = './assets/Eric-H.jpg';



export function UserBar() {
  return (
    <Container>
      <Row className="grey-bar">
        <Col>
         <UserLogin
         name='Josh Brew'
         picture={profilePic}
         />
        </Col>
        <Col xs={6}>
        <UserFeed/>
        </Col>
        <Col>
         <Notify/>
        </Col>
      </Row>
      <Row className="grey-bar">
        <Col>
         <UserLogin
         name='Alex Shohet'
         picture={profilePic2}
         />
        </Col>
        <Col xs={6}>
        <UserFeed/>
        </Col>
        <Col>
         <Notify/>
        </Col>
      </Row>
      <Row className="grey-bar">
        <Col>
         <UserLogin
         name='Eric Harris'
         picture={profilePic3}
         />
        </Col>
        <Col xs={6}>
        <UserFeed/>
        </Col>
        <Col>
         <Notify/>
        </Col>
      </Row>
    </Container>
  );
}