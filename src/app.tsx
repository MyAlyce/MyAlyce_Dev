import React from 'react'
import {getActiveStreamDir, state} from './scripts/client'//'../../graphscript/index'//

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
import { MediaDeviceOptions, ToggleAudioVideo, ViewSelfVideoStream } from './components/modules/WebRTC/Calling';
import { Widget } from './components/widgets/Widget';
import { Button } from 'react-bootstrap';
import { throwAlert } from './scripts/alerts';

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
        loggingIn:false, //show load screen
        route: '/',
        switchingUser:false,
        activeStream:undefined, //stream selected?
        deviceMode:'My Device',
        availableStreams:{} //we can handle multiple connections too
    }

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
        if(this.state.switchingUser) setTimeout(()=>{
            this.setState({switchingUser:false});
        },0.1);
    }

    render() {

        this.flipState();

        return (
            <div style={{width:'100%', height:'100%'}}>
                {this.state.loggingIn && 
                    <div style={{zIndex:100, position:'absolute', width:'100%', height:'100%', backgroundColor:'royalblue', color:'white'}}>
                        LOADING
                    </div>
                }
                {(!this.state.isLoggedIn && !TESTVIEWS) && 
                    <Login
                        useRegularLogin={false}
                        onLoginClick={this.onLoginClick}
                        thirdPartyLogins={[
                            {
                                name:'Google',
                                logo:(<img src={googleLogo} width="50px"></img>),
                                onClick:this.onGoogleLoginClick
                            }
                        ]}   
                    ></Login>
                }
                { (this.state.isLoggedIn || TESTVIEWS) && 
                    <div className="flex-container">
                        <div className="flex-header">
                         <Header />
                        </div>
                        <div id='viewcontent' className="flex-content">
                            <Navigation />
                            <div id='route'>
                                {this.state.switchingUser ? null : 
                                    <>
                                        { (this.state.route.includes('dashboard') || this.state.route === '/' || this.state.route === '') &&
                                            <Dashboard/>
                                        }
                                        { this.state.route.includes('peers') &&  <WebRTCComponent/>}
                                        { this.state.route.includes('recordings') && <Recordings 
                                            dir={getActiveStreamDir()}/>}
                                        { this.state.route.includes('settings') && <SettingsView/> }
                                        { this.state.route.includes('dev') && <Dev/>}
                                    </>
                                }
                                
                            </div>
                            <br/><br/><br/><br/>
                        </div>
                        <div className="footer">
                            <DropdownDrawer 
                                direction={'up'}
                                content={[
                                    (<div className="stream-select" key={1}>
                                        {/** Device Connect */}
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
                                                            }} 
                                                            audioOnClick={(onState:boolean)=>{  
                                                                //toggle local volume controls
                                                            }}/>
                                                    }
                                                /> : null    
                                        }
                                        {/* Device/Stream select */}
                                        { this.state.switchingUser ? null : <StreamSelect 
                                            onChange={(key, activeStream) => { 
                                                this.setState({switchingUser:true, deviceMode:key, activeStream:activeStream});
                                            }} 
                                            selected={this.state.activeStream}
                                        /> }
                                    </div>),
                                    (<span key={2}><Button onClick={()=>{ throwAlert({message:"This is an Alert", value:undefined, timestamp:Date.now()}) }}>Test Alert</Button></span>),
                                    (<span key={3}><MediaDeviceOptions/></span>),
                                    (<span key={4}>{this.state.activeStream && <ViewSelfVideoStream streamId={this.state.activeStream}/>}</span>),
                                    (<span key={5}><br/><br/><br/></span>) //pads it at the bottom to stay above the footer
                                ]}
                            />
                            <div style={{height:'50px'}}/>
                            <Footer />
                        </div>
                    </div>
                }
            </div>
        )
    }
}