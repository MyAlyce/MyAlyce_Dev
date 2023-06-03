import React from 'react';
import { Card, CardGroup, Col } from 'react-bootstrap';
import * as Icon from 'react-feather';
import { Avatar } from '../Avatar';
import { RTCCallInfo } from '../../../scripts/webrtc';

export function UserBlock(props:{
  name, 
  width?:string, 
  pictureUrl:string, 
  eyeOnClick?:(ev)=>void, 
  pinOnClick?:(ev)=>void,
  xOnClick?:(ev)=>void,
  call?:RTCCallInfo
}) {

  return (
    <Col style={{minWidth:props.width}}>
      <div>
        <Avatar 
          pictureUrl={props.pictureUrl}
        />
      </div>
      <div style={{wordWrap:"normal"}}>{props.name}</div>
      { props.eyeOnClick ? <Icon.Eye style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={props.eyeOnClick}></Icon.Eye> : null }
      { props.pinOnClick ? <Icon.MapPin style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={props.pinOnClick}></Icon.MapPin> : null}
      { props.xOnClick ? <Icon.XOctagon style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={props.xOnClick}></Icon.XOctagon> : null}
    </Col>
);
}