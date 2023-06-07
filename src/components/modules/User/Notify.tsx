import React from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import { UserAlerts } from './UserAlerts';
import { UserMessages } from './UserMessages';
import { Col } from 'react-bootstrap';

export function Notify(props:{streamId?:string, width?:string, hideAlertIcon?:boolean, hideAlertModal?:boolean}) {
  return (
    <Col className="my-auto" style={{minWidth:props.width, whiteSpace:'nowrap'}}>
      <UserAlerts
          streamId={props.streamId}
          hideIcon={props.hideAlertIcon}
          hideModal={props.hideAlertModal}
      /> 
      {props.streamId ?
        <UserMessages
          streamId={props.streamId}
        /> : null}
    </Col>
  );
}