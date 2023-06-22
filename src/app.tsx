import React from 'react'
import {getActiveStreamDir, state, webrtcData} from './scripts/client'//'../../graphscript/index'//

import { sComponent } from './components/state.component';
import { login, logout } from './scripts/login';
import { client, onLogin, onLogout } from './scripts/client';


import { Login, NavDrawer } from './components/lib_old/src/index';


import { SettingsView } from './components/pages/SettingsView';
import { Dashboard } from './components/pages/Dashboard';
import { Recordings } from './components/pages/Recordings';
import { WebRTCComponent } from './components/pages/webrtc';

import { Dev } from './components/pages/Dev';
import { Header } from './components/modules/Header/Header';
import { Navigation } from './components/modules/Navigation/Navigation';
import { DropdownDrawer } from './components/modules/Dropdown/DropdownDrawer';
import { DeviceConnect } from './components/modules/Device/DeviceConnect';
import { StreamSelect } from './components/modules/Streams/StreamSelect';
import { Demo } from './components/modules/Device/DemoMode';
import { Footer } from './components/modules/Footer/Footer';
import { AnswerCallModal, MediaDeviceOptions, ToggleAudioVideo, ViewSelfVideoStream } from './components/modules/WebRTC/Calling';
import { Widget } from './components/widgets/Widget';
import { Button } from 'react-bootstrap';
import { throwAlert } from './scripts/alerts';
import { UserAlerts } from './components/modules/User/UserAlerts';
import { RTCAudio } from './components/modules/WebRTC/WebRTCStream';
import { About } from './components/pages/About';
import { PopupModal } from './components/modules/Modal/Modal';
import { Privacy } from './components/modules/Privacy';

let googleLogo = './assets/google.png';
let myalyceLogo = './assets/myalyce.png';

state.subscribeEvent('route', (route:string) => {
    window.history.pushState(undefined, route, location.origin + route); //uhh
});
  
const TESTVIEWS = false //true; //skip login page (debug)

const brand = () => {
    return <img src={ myalyceLogo } width='100px' alt='MyAlyce'/>
};


// //this allows this part of the app to re-render independently
// class NavDrawerContainer extends sComponent {

//     state = {
//         navOpen: false,
//     }

//     render() {
//         return (
//             <NavDrawer fixed="left" zIndex={102} isOpen={this.state.navOpen} 
//                 brand={brand()} 
//                 onBackdropClick={() => this.setState({navOpen:false})} menuItems={[
//                     { type: 'action', icon: 'H' as any, onClick: () => this.setState({   'route':'/',   navOpen:false}), title: 'Home' },
//                     { type: 'action', icon: 'P' as any, onClick: () => this.setState({   'route':'/peers',       navOpen:false}), title: 'WebRTC' },
//                     { type: 'action', icon: 'R' as any, onClick: () => this.setState({   'route':'/recordings',  navOpen:false}), title: 'Recordings' },
//                     { type: 'action', icon: 'S' as any, onClick: () => this.setState({   'route':'/settings',       navOpen:false}), title: 'Settings' },
//                     { type: 'action', icon: 'D' as any, onClick: () => this.setState({ 'route':'/dev',         navOpen:false}),      title: 'Developer Tools' },

//                 ]}
//             /> 
//         )
//     }
// }
  
//note we're using sComponent which has some extended functionality for a global state
export class App extends sComponent {

    state = {
        isLoggedIn: false,
        fetchingLogin:true,
        loggingIn:false, //show load screen
        route: '/',
        triggerPageRerender:false,
        activeStream:undefined, //stream selected?
        deviceMode:'My Device',
        availableStreams:{} //we can handle multiple connections too
    }

    privacyModalOpen=false;

    onLoginClick(c:{email:string,password:string}) {
        login(c.email,c.password).then(async (result) => {
            let u = await onLogin(result); //process login
            //if(u) await restoreSession(u as any); //restore previous session if matching user
        })
    }

    onGoogleLoginClick() {
        login('google').then(async (result) => {
            let u = await onLogin(result); //process login
            //if(u) await restoreSession(u as any); //restore previous session if matching user
        })
    }

    logout() {
        logout().then((res) => {
            onLogout(res);
        })
    }

    setNavOpen(b:boolean) {
        this.setState({navOpen:b});
    }

    flipState() {
        if(this.state.triggerPageRerender) setTimeout(()=>{
            this.setState({triggerPageRerender:false});
        },0.1);
    }

    render() {

        this.flipState();

        return (
            <div style={{width:'100%', height:'100%'}}>
                {((!this.state.isLoggedIn || this.state.loggingIn) && !TESTVIEWS) && //TODO: RESTYLE
                    <div className='logincover' style={{zIndex:100, color:'white'}}> 
                        <div className="wave-container">
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                        </div>
                        <div className="wave-container2">
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                            <div className="wave"></div>
                        </div>
                        <div className="cover-content">
                            <img className="img-fluid" width="360" alt="myAlyce" src={myalyceLogo} />
                            { !this.state.loggingIn && !this.state.isLoggedIn && !this.state.fetchingLogin && 
                                <>
                                    <br />
                                    <br />
                                    <br />
                                    <span style={{color:'white'}}>Log In</span>
                                    <br />
                                    <br />
                                    <Button style={{   
                                        backgroundColor: 'ghostwhite',
                                    }} onClick={this.onGoogleLoginClick}>
                                        <img src={googleLogo} width="50px"></img>
                                    </Button>
                                </>
                            }
                            <Button style={{position:'absolute', top: 10, right: 10}} onClick={()=>{this.privacyModalOpen = true;  this.setState({})}}>Privacy Notice</Button>
                            {this.privacyModalOpen && <PopupModal body={<Privacy/>} onClose={()=>{this.privacyModalOpen = false; this.setState({})}}/>}
                        </div>
                        {/* <div className="cover-content">
                            <div style={{  width: '100%', textAlign: 'center' }}>
                                <img className="img-fluid" width="360" alt="myAlyce" src={myalyceLogo} />
                            </div>
                            {
                                !this.state.loggingIn && <>
                                    <br/>
                                    <Button style={{   
                                        backgroundColor: 'ghostwhite',
                                    }} onClick={this.onGoogleLoginClick}>
                                        <img src={googleLogo} width="50px"></img>
                                        <br/> Login With Google
                                    </Button>
                                </>
                            }
                        </div> */}
                        
                    </div>
                }
                { (this.state.isLoggedIn || TESTVIEWS) && 
                    <div className="flex-container">
                        <div className="flex-header">
                         <Header />
                        </div>
                        <div id='viewcontent' className="flex-content">
                            <Navigation />
                            <div id='route' className='container-fluid'>

                                {this.state.triggerPageRerender ? null : 
                                    <>
                                        { state.data.unansweredCalls && Object.keys(state.data.unansweredCalls).map((rtcId) => {
                                            return <span key={Math.random()}><AnswerCallModal streamId={rtcId}/></span>
                                        })}
                                        { 
                                            this.state.activeStream && <UserAlerts hideIcon={true}/> //render own alerts when other user is in focus, their dashboard will have an alert modal otherwise
                                        } 
                                        { state.data.availablestreams && Object.keys(state.data.availablestreams).map((rtcId) => { //render alerts 
                                            if(this.state.activeStream !== rtcId) return <span key={Math.random()}><UserAlerts streamId={rtcId} hideIcon={true}/></span>
                                        })}

                                        {/** Page URLS */}
                                        { (this.state.route.includes('dashboard') || this.state.route === '/' || this.state.route === '') &&
                                            <Dashboard/>
                                        }
                                        { this.state.route.includes('peers') &&  <WebRTCComponent/>}
                                        { this.state.route.includes('recordings') && <Recordings 
                                            dir={getActiveStreamDir()}/>}
                                        { this.state.route.includes('settings') && <SettingsView/> }
                                        { this.state.route.includes('dev') && <Dev/>}
                                        { this.state.route.includes('about') && <About/>}
                                    
                                    
                                    </>
                                }
                                
                            </div>
                        </div>
                        <div className="footer">
                            <DropdownDrawer 
                                direction={'up'}
                                openText='Open Menu'
                                closeText='Close Menu'
                                content={
                                    [<div key={1} className="d-flex flex-column" style={{gap: '10px'}}>
                                        {[
                                            (<div className="stream-select" key={1}>
                                                {   
                                                    this.state.deviceMode === 'My Device' ? 
                                                        <DeviceConnect/> : 
                                                    this.state.deviceMode === 'Demo' ? 
                                                        <Demo/> : 
                                                    this.state.activeStream ? 
                                                        <Widget 
                                                            content={
                                                                <ToggleAudioVideo streamId={this.state.activeStream} 
                                                                    videoOnClick={(onState:boolean)=>{ 
                                                                        //toggle picture in picture
                                                                        this.setState({});
                                                                    }} 
                                                                    audioOnClick={(onState:boolean)=>{  
                                                                        //toggle local volume controls
                                                                        this.setState({});
                                                                    }}/>
                                                            }
                                                        /> : null    
                                                }
                                            </div>),
                                            (<div  key={2}>{ this.state.triggerPageRerender ? null : 
                                                <StreamSelect 
                                                    onChange={(key, activeStream) => { 
                                                        this.setState({triggerPageRerender:true, deviceMode:key, activeStream:activeStream});
                                                    }} 
                                                    selected={this.state.activeStream}
                                                /> }
                                            </div>),
                                            (<span key={3}><Button onClick={()=>{ throwAlert({message:"This is an Alert", value:undefined, timestamp:Date.now()}) }}>Test Alert</Button></span>),
                                            (<span key={4}><MediaDeviceOptions/></span>),
                                            (<span key={5}>{ this.state.activeStream && <><ViewSelfVideoStream streamId={this.state.activeStream}/> { webrtcData.availableStreams[this.state.activeStream].audioStream && <RTCAudio /> } </> }</span>),
                                        ]}
                                    </div>]
                                }
                            />
                            <Footer />
                        </div>
                    </div>
                }
            </div>
        )
    }
}