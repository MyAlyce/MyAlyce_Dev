import React from 'react'
import { sComponent } from "../state.component";
import { Button } from 'react-bootstrap';
import { recordCSV, stopRecording } from '../../scripts/datacsv';
import { SensorDefaults, client, webrtc } from '../../scripts/client';
import { StreamToggle } from './StreamToggle';
import * as Icon from 'react-feather'
import { RTCCallInfo } from '../../scripts/webrtc';
import { Widget } from '../widgets/Widget';

export class RecordBar extends sComponent {

    state = {
        isRecording:false,
        streamRecording:undefined,
        activeStream:undefined,
    }
    
    dir?:string;  
    toggled=[...SensorDefaults] as any[];

    onChange=(ev:{isRecording:boolean, streamId?:string})=>{}

    constructor(props:{dir?:string, onChange:(ev:{isRecording:boolean, streamId?:string})=>void}) {
        super(props);

        this.dir = props.dir;
    }


    record(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[], subTitle?:string, dir?:string) {
        recordCSV(streamId, sensors, subTitle, dir);
        this.setState({streamRecording:streamId});
        if(this.onChange) this.onChange({isRecording:true, streamId})
    }

    async stopRecording(streamId?:string, dir?:string) {
        await stopRecording(streamId, dir, client.currentUser.firstName+client.currentUser.lastName); //folder list will be associated with current user so they will only see indexeddb folders for users they are associated with
        this.setState({streamRecording:undefined});
        if(this.onChange) this.onChange({isRecording:false, streamId})
    }

    render () {
        
        let dir = this.dir ? this.dir : 
            this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName + (webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : 
            client.currentUser.firstName + client.currentUser.lastName;
        
        return (
            <Widget
                style={{width: '30rem'}}
                header="Recording:"
                content={(
                    <div className="d-grid gap-2">
                        {this.state.isRecording ? 
                            <Button variant='info' onClick={()=>{ 
                                stopRecording(this.state.streamRecording, dir, client.currentUser.firstName+client.currentUser.lastName) 
                            }}>
                                <Icon.Pause className="align-text-bottom" size={20}></Icon.Pause>&nbsp;Pause
                            </Button> 
                                : 
                            <>
                                <Button variant='danger' onClick={()=>{
                                    this.record(this.state.activeStream, this.toggled, dir, dir)}}
                                >
                                    <Icon.Circle className="align-text-bottom" size={20}></Icon.Circle>&nbsp;Record
                                </Button>{' '}
                                <StreamToggle 
                                    toggled={this.toggled}
                                    subscribable={SensorDefaults}
                                    onChange = {(ev:any)=>{ 
                                        this.setState({});
                                    }}
                                />
                            </> 
                        }
                    </div>
                )}
            />
        );
    }
}