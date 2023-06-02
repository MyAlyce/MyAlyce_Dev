import React, {Component} from 'react'
import {webrtc} from '../../scripts/client'
import { RTCCallInfo } from '../../scripts/webrtc';
import { UserBar } from '../ui/UserBar/UserBar';
import { Widget } from '../widgets/Widget';
import { Card } from 'react-bootstrap';

const personIcon = './assets/person.jpg';

export class StreamSelect extends Component<{[key:string]:any}> {
   
    state = { //synced with global state
        activeStream:undefined as any,
        dropdownOpen: true
    }

    wrapperRef:any;
    selectedKey?:string = 'Demo';

    onchange=(key, activeStream)=>{}

    constructor(props:{onChange:(key)=>void, selected?:string}) {
        super(props);
        if(props.selected) this.state.activeStream = props.selected;
        if(props?.onChange) 
            this.onchange = props.onChange;
    }
    

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    setWrapperRef = (node) => {
        this.wrapperRef = node;
    };
    
    handleClickOutside = (event) => {
        // if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
        //     this.setState({ dropdownOpen: false });
        // }
    };

    toggleDropdown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    };

    onItemClick = (key: string | undefined) => {
        this.selectedKey = key;
        let activeStream;
        if(key === 'My Device' || key === 'Demo')
            activeStream = undefined;//, dropdownOpen: false });
        else 
            activeStream = key;
            
        this.onchange(key,activeStream);
    };

    render() {
      
        return (
            <Widget 
                header={<div style={{cursor:'pointer', width:'100%', height:'100%'}} onClick={this.toggleDropdown}>Select Stream:</div>}
                subtitle={(
                    <Card style={{cursor:'pointer'}} onClick={()=>{this.onItemClick(this.selectedKey)}} className="selected-item">
                        <Card.Header>
                            Selected: {this.state.activeStream
                                ? `${(webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName} ${(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName}`
                                : this.selectedKey}
                        </Card.Header>
                    </Card>
                )}
                content={
                    <div ref={this.setWrapperRef} className="stream-select">
                        
                        {this.state.dropdownOpen && (
                        <div className="stream-select-dropdown">
                            <div
                                key="Demo"
                                style={{cursor:'pointer'}}
                                onClick={() => this.onItemClick('Demo')}
                                className={this.state.activeStream === undefined ? 'selected' : ''}
                            >
                                <Widget subtitle={"Demo Data"}/>
                            </div>
                            <div
                                key="My-Device"
                                style={{cursor:'pointer'}}
                                onClick={() => this.onItemClick('My Device')}
                                className={this.state.activeStream === undefined ? 'selected' : ''}
                            >
                                <Widget subtitle={<>My Device<br/></>} content={<UserBar/>} />
                                
                            </div>
                            {Object.keys(webrtc.rtc).length > 0 &&
                            Object.keys(webrtc.rtc).map((key) => {
                                return (
                                <div
                                    key={key}
                                    style={{cursor:'pointer'}}
                                    onClick={() => this.onItemClick(key)}
                                    className={this.state.activeStream === key ? 'selected' : ''}
                                >
                                    <Widget content={<UserBar streamId={key}/>} />
                                </div>
                                );
                            })}
                        </div>
                        )}
                    </div>
                }
            />
           
        );
    }
}