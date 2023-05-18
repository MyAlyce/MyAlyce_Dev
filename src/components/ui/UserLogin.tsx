import React from 'react';
import profilePic from '../assets/JoshBrew.jpg';
import { Card, CardGroup } from 'react-bootstrap';
import * as Icon from 'react-feather';

export function UserLogin({name, picture}) {

  return (
    <CardGroup>
    <Card>
      <Card.Body>
      <img className="rounded-circle" width="50" alt={name} src={picture} />
      </Card.Body>
    </Card>
    <Card>
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