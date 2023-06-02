import React from 'react';
import { Card, CardGroup, Col } from 'react-bootstrap';
import * as Icon from 'react-feather';
import { Avatar } from '../Avatar';

export function UserBlock(props:{name, pictureUrl:string, eyeOnClick?:(ev)=>void, pinOnClick?:(ev)=>void}) {

  return (
    <Col>
      <div>
        <Avatar 
          pictureUrl={props.pictureUrl}
        />
      </div>
      <div style={{wordWrap:"normal"}}>{props.name}</div>
      <Icon.Eye className="align-text-bottom" size={20} onClick={props.eyeOnClick}></Icon.Eye>&nbsp;
      <Icon.MapPin className="align-text-bottom" size={20} onClick={props.pinOnClick}></Icon.MapPin>
    </Col>
);
}