import React from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import Badge from 'react-bootstrap/Badge';
import { webrtc } from '../../../scripts/client';
import { RTCCallInfo } from '../../../scripts/webrtc';

export function UserMessages(props:{streamId:string}) {

  let chats = (webrtc.rtc[props.streamId] as RTCCallInfo).messages;

  return (
    <>
      <Icon.MessageSquare className="align-text-bottom" size={40}></Icon.MessageSquare>
      <Badge bg="secondary">{chats ? chats.length : 0}</Badge> {/** TODO: have a number for the number of unchecked messages */}
    </>
  );
}