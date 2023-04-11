import React, {Component} from 'react'
import {webrtc} from '../../scripts/client'
import { RTCCallInfo } from '../../scripts/webrtc';


export class StreamSelect extends Component<{[key:string]:any}> {
   
    state = { //synced with global state
        activeStream:undefined
    }

    onchange=()=>{}

    constructor(props:{onChange:()=>void}) {
        super(props);
        if(props?.onChange) 
            this.onchange = props.onChange;
    }
    
    render() {
        
        let onchange = (ev) => {
            let value = ev.target.value;
            this.setState({activeStream:value});
            this.onchange();
        }

        return (
            <div>
                <select onChange={onchange} defaultValue = {this.state.activeStream}>
                    <option value={undefined}>My Device</option>
                    { Object.keys(webrtc.rtc).length > 0 &&
                        Object.keys(webrtc.rtc).map((key) => {
                            return (
                                <option 
                                    key={key} 
                                    value={key}
                                >{(webrtc.rtc[key] as RTCCallInfo).firstName ? (webrtc.rtc[key] as RTCCallInfo).firstName : (webrtc.rtc[key] as RTCCallInfo)._id} {(webrtc.rtc[key] as RTCCallInfo).lastName ? (webrtc.rtc[key] as RTCCallInfo).lastName : ""}
                                </option>
                            );  
                        })
                    }
                </select>
            </div>
        )
    }
}