import React from 'react';
import { Card, CardGroup } from 'react-bootstrap';
import * as Icon from 'react-feather';
import { Avatar } from './Avatar';

export function UserLogin({name, picture}) {

  return (
    <CardGroup>
    <Card style={{ width: '12rem' }}>
      <Card.Body>
      <Avatar 
        pictureUrl={picture}
      />
      <Card.Subtitle>&nbsp;&nbsp;{name}</Card.Subtitle>
          <Card.Text>&nbsp;&nbsp;
        <Icon.Eye className="align-text-bottom" size={20}></Icon.Eye>&nbsp;
        <Icon.MapPin className="align-text-bottom" size={20}></Icon.MapPin>
        </Card.Text>
      </Card.Body>
    </Card>
    </CardGroup>
);
}