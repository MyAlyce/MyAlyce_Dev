import React, { Component } from 'react';
import { Collapse } from 'react-bootstrap';

import './DropdownDrawer.css'

export class DropdownDrawer extends Component<{direction?:'up'|'down', isOpen?:boolean, content:any[]}> {
  state = {
    isOpen: true,
    exited:false
  };

  toggleDrawer = () => {
    if(!this.state.isOpen) this.state.exited = false;
    this.setState((prevState:any) => ({ isOpen: !prevState.isOpen}));
  };

  render() {
    const { isOpen, exited } = this.state;
    let { direction, content } = this.props;
    if(!direction) direction = 'down';

    const arrowClass = `arrow-button arrow-button-${direction}`;

    return (
      <div className="drawer-container">
        {direction === 'up' ? 
            <div>
                <div className={arrowClass} onClick={this.toggleDrawer}>
                    {isOpen ? 'Select Stream ▼' : 'Select Stream ▲' }
                </div>
            </div>
            : null
        }
        <Collapse in={isOpen} onExited={() => { this.setState({exited:true})}}>
            <div className="drawer-content">
                {exited ? null : content}
            </div>
        </Collapse> 
        {direction === 'down' ?
            <div>
                <div className={arrowClass}  onClick={this.toggleDrawer}>
                    {isOpen ? 'Stream Select ▲' : 'Stream Select ▼' }
                </div>
            </div>
            : null
        }
      </div>
    );
  }
}