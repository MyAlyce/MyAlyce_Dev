import React from 'react';
import { Card, CardGroup, Col } from 'react-bootstrap';
import * as Icon from 'react-feather';
import { Avatar } from '../Avatar';

export function UserBlock(props:{
  name, 
  width?:string, 
  pictureUrl:string, 
  eyeOnClick?:(ev)=>void, 
  pinOnClick?:(ev)=>void,
  xOnClick?:(ev)=>void
}) {

  return (
    <Col style={{minWidth:props.width}}>
      <div>
        <Avatar 
          pictureUrl={props.pictureUrl}
        />
      </div>
      <div style={{wordWrap:"normal"}}>{props.name}</div>
      { props.eyeOnClick ? <><Icon.Eye className="align-text-bottom" size={20} onClick={props.eyeOnClick}></Icon.Eye>&nbps;</> : null }
      { props.pinOnClick ? <Icon.MapPin className="align-text-bottom" size={20} onClick={props.pinOnClick}></Icon.MapPin> : null}
      { props.xOnClick ? <Icon.XOctagon className="align-text-bottom" size={20} onClick={props.xOnClick}></Icon.XOctagon> : null}
    </Col>
);
}