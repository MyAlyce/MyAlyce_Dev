import React, { Component } from 'react';
import { Collapse } from 'react-bootstrap';

import './DropdownDrawer.css'

export class DropdownDrawer extends Component<{direction?:'up'|'down', isOpen?:boolean, content:any[]}> {
  state = {
    isOpen: false,
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
            <table style={{width:'100%'}}>
                <tbody>
                    <tr>
                        <td width='100%'></td>
                        <td>
                            <button className={arrowClass} onClick={this.toggleDrawer}>
                                {isOpen ? '▼' : '▲' }
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            : null
        }
        <Collapse in={isOpen} onExited={() => { this.setState({exited:true})}}>
            <div className="drawer-content">
                {exited ? null : content}
            </div>
        </Collapse> 
        {direction === 'down' ?
            <table style={{width:'100%'}}>
                <tbody>
                    <tr>
                        <td width='100%'></td>
                        <td>
                            <button className={arrowClass}  onClick={this.toggleDrawer}>
                                {isOpen ? '▲' : '▼' }
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            : null
        }
      </div>
    );
  }
}