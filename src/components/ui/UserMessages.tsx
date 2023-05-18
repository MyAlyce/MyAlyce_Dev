import React from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';

export function UserMessages() {
  return (
    <Card style={{ width: '5rem' }}>
      <Card.Body>
      <Icon.MessageSquare className="align-text-bottom" size={40}></Icon.MessageSquare>
      <Badge bg="secondary">6</Badge>
      </Card.Body>
    </Card>
  );
}