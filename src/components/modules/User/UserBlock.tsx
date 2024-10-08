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
  vitalsOnClick?:(ev)=>void,
  audioOnClick?:(onState:boolean)=>void,
  videoOnClick?:(onState:boolean)=>void,
  call?:RTCCallInfo
}> {

  vstateSub;
  astateSub;

  state={
    switchingMedia:false
  }

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
      if(this.vstateSub)
        state.unsubscribeEvent(this.props.call._id+'hasVideo', this.vstateSub);
    }
  }
  
  
  render() {

    let callMedia;
    if(this.props.call) {
      callMedia = getCallerAudioVideo(this.props.call._id);
    }

    //console.log(callMedia?.hasVideo, this.props.videoOnClick, callMedia?.hasVideo);

    let mediaSection = (<>
    { (this.props.audioOnClick !== undefined && callMedia?.hasAudio === true) ? <>
          { this.props.call?.viewingAudio ? <Icon.Mic
            onClick={() => {
              (this.props.call as RTCCallInfo).viewingAudio = false;
              state.setState({[(this.props.call as RTCCallInfo)._id+'viewingAudio']:false});
              this.props.audioOnClick?.(false);
            }}
          /> : <Icon.MicOff
            onClick={() => {
              (this.props.call as RTCCallInfo).viewingAudio = true;
              state.setState({[(this.props.call as RTCCallInfo)._id+'viewingAudio']:true});
              this.props.audioOnClick?.(true);
            }}
          /> }
          </> : null }
        { (this.props.videoOnClick !== undefined && callMedia?.hasVideo === true) ? <>
            { this.props.call?.viewingVideo ? 
              <Icon.Video
                onClick={() => {
                  (this.props.call as RTCCallInfo).viewingVideo = false;
                  state.setState({[(this.props.call as RTCCallInfo)._id+'viewingVideo']:false});
                  this.props.videoOnClick?.(false);
                }}
              /> : 
              <Icon.VideoOff
                onClick={() => {
                  (this.props.call as RTCCallInfo).viewingVideo = true;
                  state.setState({[(this.props.call as RTCCallInfo)._id+'viewingVideo']:true});
                  this.props.videoOnClick?.(true);
                }}
              /> 
            }
          </> : null }
    </>)
    
    //console.log('rerendering with', callMedia, mediaSection);

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
        { this.props.vitalsOnClick ? <Icon.Heart style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={this.props.vitalsOnClick}></Icon.Heart> : null }
        { mediaSection }
        { this.props.xOnClick ? <Icon.XOctagon style={{cursor:'pointer'}}  className="align-text-bottom" size={20} onClick={this.props.xOnClick}></Icon.XOctagon> : null}
      </Col>
    );
  }

}