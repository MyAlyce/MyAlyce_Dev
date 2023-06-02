import React from 'react';
import Container from 'react-bootstrap/esm/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { UserBlock } from './UserBlock';
import { UserFeed } from './UserFeed';
import { Notify } from './Notify';

import { client } from '../../../scripts/client';
import {webrtc} from '../../../scripts/client'
import { RTCCallInfo } from '../../../scripts/webrtc';

export function UserBar(props:{streamId?:string}) {

  let name;
  let profilePic;

  if(props.streamId) {
    profilePic = (webrtc.rtc[props.streamId] as RTCCallInfo).pictureUrl;
    name = (webrtc.rtc[props.streamId] as RTCCallInfo).firstName + ' ' + (webrtc.rtc[props.streamId] as RTCCallInfo).lastName;
  } else {
    profilePic = client.currentUser.pictureUrl;
    name = client.currentUser.firstName + ' ' + client.currentUser.lastName;
  }

  if(!profilePic) {
    profilePic = './assets/person.jpg';
  }
  if(!name) name = props.streamId ? props.streamId : 'Me';

  return (
    <Container className="my-auto">
      <Row className="grey-bar">
        <UserBlock
            name={name}
            pictureUrl={profilePic}
        />
        <UserFeed
          streamId={props.streamId}
        />
        <Notify
          streamId={props.streamId}
        />
      </Row>
    </Container>
  );
}