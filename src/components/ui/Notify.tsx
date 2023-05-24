import React from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import { UserAlerts } from './UserAlerts';
import { UserMessages } from './UserMessages';

export function Notify(props:{streamId?:string}) {
  return (
    <CardGroup>
        <UserAlerts
            streamId={props.streamId}
        /> 
        {props.streamId ?
          <UserMessages
            streamId={props.streamId}
          /> : null}
    </CardGroup>
  );
}