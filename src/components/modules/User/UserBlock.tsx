import React, {Component} from 'react';
import { Card, CardGroup, Col } from 'react-bootstrap';
import * as Icon from 'react-feather';
import { Avatar } from './Avatar';
import { RTCCallInfo, getCallerAudioVideo } from '../../../scripts/webrtc';
import {state} from '../../../scripts/client'

export class UserBlock extends Component<{
  name, 
  width?:string, 
  pictureUrl:string, 
  eyeOnClick?:(ev)=>void, 
  pinOnClick?:(ev)=>void,
  xOnClick?:(ev)=>void,
  audioOnClick?:(onState:boolean)=>void,
  videoOnClick?:(onState:boolean)=>void,
  call?:RTCCallInfo
}> {

  vstateSub;
  astateSub;

  componentDidMount(): void {
    if(this.props.call) {
      this.astateSub = state.subscribeEvent(this.props.call._id+'hasAudio', (value) => {
        this.setState({}); //rerender
      });
      this.vstateSub = state.subscribeEvent(this.props.call._id+'hasVideo', (value) => {
        this.setState({}); //rerender
      });
    }
  }

  componentWillUnmount(): void {
    if(this.props.call) {
      if(this.astateSub)
        state.unsubscribeEvent(this.props.call._id+'hasAudio', this.astateSub);
      if(this.astateSub)
        state.unsubscribeEvent(this.props.call._id+'hasVideo', this.astateSub);
    }
  }
  
  render() {

    let callMedia;
    if(this.props.call) {
      callMedia = getCallerAudioVideo(this.props.call._id);
    }
  
    console.log(callMedia);
    
    return (
      <Col style={{minWidth:this.props.width}}>
        <div>
          <Avatar 
            pictureUrl={this.props.pictureUrl}
          />
        </div>
        <div style={{wordWrap:"normal"}}>{this.props.name}</div>
        { this.props.eyeOnClick ? <Icon.Eye style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={this.props.eyeOnClick}></Icon.Eye> : null }
        { this.props.pinOnClick ? <Icon.MapPin style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={this.props.pinOnClick}></Icon.MapPin> : null}
        { (this.props.audioOnClick && callMedia?.hasAudio) ? <>
          { this.props.call?.viewingAudio ? <Icon.Mic
            onClick={() => {
              (this.props.call as RTCCallInfo).viewingAudio = false;
              this.props.audioOnClick?.(false);
              state.setState({[(this.props.call as RTCCallInfo)._id+'viewingAudio']:false});
            }}
          /> : <Icon.MicOff
            onClick={() => {
              (this.props.call as RTCCallInfo).viewingAudio = true;
              this.props.audioOnClick?.(true);
              state.setState({[(this.props.call as RTCCallInfo)._id+'viewingAudio']:true});
            }}
          /> }
          </> : null }
        { (this.props.videoOnClick && callMedia?.hasVideo) ? <>
            { this.props.call?.viewingVideo ? 
              <Icon.Video
                onClick={() => {
                  (this.props.call as RTCCallInfo).viewingVideo = false;
                  this.props.videoOnClick?.(false);
                  state.setState({[(this.props.call as RTCCallInfo)._id+'viewingVideo']:false});
                }}
              /> : 
              <Icon.VideoOff
                onClick={() => {
                  (this.props.call as RTCCallInfo).viewingVideo = true;
                  this.props.videoOnClick?.(true);
                  state.setState({[(this.props.call as RTCCallInfo)._id+'viewingVideo']:true});
                }}
              /> 
            }
          </> : null }
          { this.props.xOnClick ? <Icon.XOctagon style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={this.props.xOnClick}></Icon.XOctagon> : null}
      </Col>);
  }

}