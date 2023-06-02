import React, { useState, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import CardGroup from 'react-bootstrap/CardGroup';
import Overlay from 'react-bootstrap/Overlay';
import { StreamText } from '../../modules/StreamText';
import { Col, Row, Table } from 'react-bootstrap';
import { BeatingSVG } from '../../svg/BeatingSVG/BeatingSVG';
import { ActivityPath } from '../../svg/paths';

export function UserFeed(props:{streamId?:string}) {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
      <>
        <Col className="my-auto">
            <BeatingSVG subscribeTo={props.streamId ? props.streamId+'hr' : 'hr'} objectKey={'hr'}/>
            <br/><StreamText stateKey={props.streamId ? props.streamId+'hr' : 'hr'} objectKey={'hr'}/> /min
        </Col>
        <Col className="my-auto">
          <BeatingSVG subscribeTo={props.streamId ? props.streamId+'hr' : 'hr'} objectKey={'hr'} customContent={<Icon.Activity color="darkgreen" size={40}/>}/>
          <br/><br/><StreamText stateKey={props.streamId ? props.streamId+'hr' : 'hr'} objectKey={'hrv'} /> HRV
        </Col>
        <Col className="my-auto">
          <BeatingSVG subscribeTo={props.streamId ? props.streamId+'breath' : 'breath'} bpm={0.00001} objectKey={'breath'} customContent={<Icon.Wind size={40}></Icon.Wind>}/>
          <br/><br/><StreamText stateKey={props.streamId ? props.streamId+'breath' : 'breath'} objectKey={'breath'}/> /min
        </Col>
      </>
      
  );
}

/**
 * 
 *TODO: make these tooltips instead for the card body so it's more intuitive 
    <Overlay target={target.current} show={show} placement="top"> 
        {({
          placement: _placement,
          arrowProps: _arrowProps,
          show: _show,
          popper: _popper,
          hasDoneInitialMeasure: _hasDoneInitialMeasure,
          ...props
        }) => (
          <div
            {...props}
            style={{
              position: 'absolute',
              backgroundColor: '#CA7EFC',
              padding: '2px 10px',
              color: 'white',
              borderRadius: 3,
              ...props.style,
            }}
          >
            Heart Rate
          </div>
        )}
      </Overlay> 
 */