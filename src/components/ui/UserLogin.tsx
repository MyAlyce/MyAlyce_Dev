import React from 'react';
import { Card, CardGroup } from 'react-bootstrap';
import * as Icon from 'react-feather';

const profilePic = './assets/person.png';

export function UserLogin({name, picture}) {

  return (
    <CardGroup>
    <Card style={{ width: '5.3rem' }}>
      <Card.Body>
      <img className="rounded-circle" width="50" alt={profilePic} src={picture} />
      </Card.Body>
    </Card>
    <Card style={{ width: '12rem' }}>
      <Card.Body>
      <Card.Subtitle>{name}</Card.Subtitle>
          <Card.Text>
        <Icon.Eye className="align-text-bottom" size={20}></Icon.Eye>&nbsp;
        <Icon.MapPin className="align-text-bottom" size={20}></Icon.MapPin>
        </Card.Text>
      </Card.Body>
    </Card>
    </CardGroup>
);
}