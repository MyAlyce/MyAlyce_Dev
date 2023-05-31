import React, { useState, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import CardGroup from 'react-bootstrap/CardGroup';
import Overlay from 'react-bootstrap/Overlay';
import { StreamText } from '../modules/StreamText';

export function UserFeed(props:{streamId?:string}) {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <CardGroup>
      <Card style={{ width: '12rem' }}>
      <Card.Body>
      <Icon.Heart className="align-text-bottom" size={40} color="red"  onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(false)}>
        </Icon.Heart>&nbsp;<StreamText stateKey={props.streamId ? props.streamId+'hr' : 'hr'} objectKey={'hr'}/>
      </Card.Body>
      </Card>
      <Card style={{ width: '12rem' }}>
      <Card.Body>
        <Icon.Activity className="align-text-bottom" size={40} color="green">
          </Icon.Activity>&nbsp;HRV: <StreamText stateKey={props.streamId ? props.streamId+'hr' : 'hr'} objectKey={'hrv'} />
      </Card.Body>
      </Card>
      <Card style={{ width: '12rem' }}>
      <Card.Body>
        <Icon.Wind className="align-text-bottom" size={40}>
          </Icon.Wind>&nbsp;<StreamText stateKey={props.streamId ? props.streamId+'breath' : 'breath'} objectKey={'breath'}/>
      </Card.Body>
      </Card>
      {/** TODO: make these tooltips instead for the card body so it's more intuitive */}
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
    </CardGroup>
  );
}