import React from 'react';
import { Card, CardGroup } from 'react-bootstrap';
import * as Icon from 'react-feather';
import { defaultProfilePic } from '../../scripts/client';

export function UserLogin({name, picture}) {

  return (
    <CardGroup>
    <Card style={{ width: '12rem' }}>
      <Card.Body>
      <div className="float-start"><img className="rounded-circle" width="50" src={picture ? picture : defaultProfilePic} /></div>
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