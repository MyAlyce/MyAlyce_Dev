import React from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';
import { alerts, webrtc, webrtcData } from '../../scripts/client';

export function UserAlerts(props:{streamId?:string}) {

  let as = props?.streamId ? webrtcData.availableStreams[props.streamId].alerts.length : alerts.length;

  return (
    <Card>
      <Card.Body>
      <Icon.Bell className="align-text-bottom" size={40}></Icon.Bell>
      <Badge bg="danger">{as}</Badge>
      </Card.Body>
    </Card>
  );
}