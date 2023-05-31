import React from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';

export function UserAlerts(props:{streamId?:string}) {
  return (
    <Card>
      <Card.Body>
      <Icon.Bell className="align-text-bottom" size={40}></Icon.Bell>
      <Badge bg="danger">3</Badge>
      </Card.Body>
    </Card>
  );
}