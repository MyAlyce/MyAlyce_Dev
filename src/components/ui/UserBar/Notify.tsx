import React from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import { UserAlerts } from './UserAlerts';
import { UserMessages } from './UserMessages';
import { Col } from 'react-bootstrap';

export function Notify(props:{streamId?:string, width?:string}) {
  return (
    <Col className="my-auto" style={{minWidth:props.width}}>
      <UserAlerts
          streamId={props.streamId}
      /> 
      {props.streamId ?
        <UserMessages
          streamId={props.streamId}
        /> : null}
    </Col>
  );
}