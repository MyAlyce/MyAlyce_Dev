import React, { useState, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import * as Icon from 'react-feather';
import CardGroup from 'react-bootstrap/CardGroup';
import Overlay from 'react-bootstrap/Overlay';

export function UserFeed() {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  return (
    <CardGroup>
      <Card>
      <Card.Body>
      <Icon.Heart className="align-text-bottom" size={40} color="red" ref={target} onMouseEnter={() => setShow(!show)} onMouseLeave={() => setShow(false)}></Icon.Heart>&nbsp;67/min
      </Card.Body>
      </Card>
      <Card>
      <Card.Body>
        <Icon.Activity className="align-text-bottom" size={40} color="green"></Icon.Activity>&nbsp;HRV
      </Card.Body>
      </Card>
      <Card>
      <Card.Body>
        <Icon.Wind className="align-text-bottom" size={40}></Icon.Wind>&nbsp;8.3 min
      </Card.Body>
      </Card>
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