import React, { Component } from 'react';
import { Collapse } from 'react-bootstrap';

import './DropdownDrawer.css'

export class DropdownDrawer extends Component<{direction?:'up'|'down', openText?:string, closeText?:string, isOpen?:boolean, content:any[]}> {
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

    let openArrow = direction ? '▼' : '▲';
    let closeArrow = direction ? '▲' : '▼';

    return (
      <div className="drawer-container">
        {direction === 'up' ? 
            <table style={{width:'100%'}}>
                <tbody>
                    <tr>
                        <td width='100%'></td>
                        <td>
                            <button className={arrowClass} onClick={this.toggleDrawer}>
                                <div>
                                    {isOpen ? (this.props.closeText ? this.props.closeText + ' ' + openArrow : openArrow) : (this.props.openText ? this.props.openText + ' ' + closeArrow : closeArrow) }
                                </div>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            : null
        }
        <Collapse className="drawer-content" in={isOpen} onExited={() => { this.setState({exited:true})}}>
            <div>
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