import React, {Component} from 'react'
import {webrtc} from '../../scripts/client'
import { RTCCallInfo } from '../../scripts/webrtc';
import { Avatar } from '../lib/src';
import { UserBar } from '../ui/UserBar/UserBar';

const personIcon = './assets/person.jpg';

export class StreamSelect extends Component<{[key:string]:any}> {
   
    state = { //synced with global state
        activeStream:undefined as any,
        dropdownOpen: true
    }

    wrapperRef:any;
    selectedKey?:string = 'Demo';

    onchange=(key)=>{}

      
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
        if(key === 'My Device' || key === 'Demo')
            this.setState({ activeStream: undefined});//, dropdownOpen: false });
        else 
            this.setState({ activeStream: key});//, dropdownOpen: false });
            
        this.onchange(key);
    };

    render() {
      
        return (
            <div ref={this.setWrapperRef} className="stream-select">
                Select Stream:
                <div onClick={this.toggleDropdown} className="selected-item">
                Selected: {this.state.activeStream
                    ? `${(webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName} ${(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName}`
                    : this.selectedKey}
                </div>
                {this.state.dropdownOpen && (
                <div className="stream-select-dropdown">
                    <div
                        key="Demo"
                        onClick={() => this.onItemClick('Demo')}
                        className={this.state.activeStream === undefined ? 'selected' : ''}
                    >
                        Demo
                    </div>
                    <div
                        key="My-Device"
                        onClick={() => this.onItemClick('My Device')}
                        className={this.state.activeStream === undefined ? 'selected' : ''}
                    >
                        <UserBar/>
                    </div>
                    {Object.keys(webrtc.rtc).length > 0 &&
                    Object.keys(webrtc.rtc).map((key) => {
                        return (
                        <div
                            key={key}
                            onClick={() => this.onItemClick(key)}
                            className={this.state.activeStream === key ? 'selected' : ''}
                        >
                            <UserBar
                                streamId={key}
                            />
                        </div>
                        );
                    })}
                </div>
                )}
            </div>
        );
    }
}