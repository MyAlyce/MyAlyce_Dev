import React from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import { UserAlerts } from './UserAlerts';
import { UserMessages } from './UserMessages';
import { Col } from 'react-bootstrap';

export function Notify(props:{
  streamId?:string, 
  width?:string, 
  hideAlertIcon?:boolean, 
  hideAlertModal?:boolean,
  hideMessageIcon?:boolean, 
  hideMessageModal?:boolean,
  useActiveStream?:boolean
}) {
  return (
    <Col className="my-auto" style={{minWidth:props.width, whiteSpace:'nowrap'}}>
      <UserAlerts
          streamId={props.streamId}
          hideIcon={props.hideAlertIcon}
          hideModal={props.hideAlertModal}
          useActiveStream={props.useActiveStream}
      /> 
      {props.streamId ?
        <UserMessages
          streamId={props.streamId}
          hideIcon={props.hideMessageIcon}
          hideModal={props.hideMessageModal}
        /> : null}
    </Col>
  );
}