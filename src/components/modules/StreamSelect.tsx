import React, {Component} from 'react'
import {webrtc} from '../../scripts/client'
import { RTCCallInfo } from '../../scripts/webrtc';
import { Avatar } from '../lib/src';

const personIcon = './assets/person.jpg';

export class StreamSelect extends Component<{[key:string]:any}> {
   
    state = { //synced with global state
        activeStream:undefined as any,
        dropdownOpen: false
    }

    wrapperRef:any;

    onchange=(key)=>{}

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
        if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
            this.setState({ dropdownOpen: false });
        }
    };

    toggleDropdown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    };

    onItemClick = (key: string | undefined) => {
        if(key === 'my-device' || key === 'demo')
            this.setState({ activeStream: undefined, dropdownOpen: false });
        else 
            this.setState({ activeStream: key, dropdownOpen: false });
            
        this.onchange(key);
    };

      
    constructor(props:{onChange:(key)=>void, selected?:string}) {
        super(props);
        if(props.selected) this.state.activeStream = props.selected;
        if(props?.onChange) 
            this.onchange = props.onChange;
    }
    
    render() {
      
        return (
            <div ref={this.setWrapperRef} className="stream-select">
                Select Stream:
                <div onClick={this.toggleDropdown} className="selected-item">
                {this.state.activeStream
                    ? `${(webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName} ${(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName}`
                    : 'My Device'}
                </div>
                {this.state.dropdownOpen && (
                <ul className="stream-select-dropdown">
                    <li
                        key="my-device"
                        onClick={() => this.onItemClick('my-device')}
                        className={this.state.activeStream === undefined ? 'selected' : ''}
                    >
                    My Device
                    </li>
                    <li
                        key="demo"
                        onClick={() => this.onItemClick('demo')}
                        className={this.state.activeStream === undefined ? 'selected' : ''}
                    >
                    Demo
                    </li>
                    {Object.keys(webrtc.rtc).length > 0 &&
                    Object.keys(webrtc.rtc).map((key) => {
                        return (
                        <li
                            key={key}
                            onClick={() => this.onItemClick(key)}
                            className={this.state.activeStream === key ? 'selected' : ''}
                        >
                            <Avatar
                            dataState="done"
                            imgSrc={
                                (webrtc.rtc[key] as RTCCallInfo).pictureUrl
                                ? (webrtc.rtc[key] as RTCCallInfo).pictureUrl
                                : personIcon
                            }
                            size="xs"
                            status="online"
                            name={{
                                first: (webrtc.rtc[key] as RTCCallInfo)?.firstName as string,
                                last: (webrtc.rtc[key] as RTCCallInfo)?.lastName as string,
                            }}
                            backgroundColor="lightblue"
                            />
                            {(webrtc.rtc[key] as RTCCallInfo).firstName
                            ? (webrtc.rtc[key] as RTCCallInfo).firstName
                            : (webrtc.rtc[key] as RTCCallInfo)._id}{' '}
                            {(webrtc.rtc[key] as RTCCallInfo).lastName
                            ? (webrtc.rtc[key] as RTCCallInfo).lastName
                            : ''}
                        </li>
                        );
                    })}
                </ul>
                )}
            </div>
        );
    }
}