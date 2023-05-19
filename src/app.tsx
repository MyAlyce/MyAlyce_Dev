import React from 'react'
import {state, webrtc} from './scripts/client'//'../../graphscript/index'//
import { sComponent } from './components/state.component';
import { login, logout } from './scripts/login';
import { client, onLogin, onLogout } from './scripts/client';
import { Login, Avatar, TopBar, NavDrawer } from './components/lib/src/index';


import { SettingsView } from './components/pages/SettingsView';
import { Dashboard } from './components/pages/Dashboard';
import { Recordings } from './components/pages/Recordings';
import { WebRTCComponent } from './components/pages/webrtc';

import { Device } from './components/modules/device';
import { Dev } from './components/pages/Dev';
import { RTCCallInfo } from './scripts/webrtc';
import { Header } from './components/ui/Header';
import { Navigation } from './components/ui/Navigation';
import { UserBar } from './components/ui/UserBar';

let googleLogo = './assets/google.png';
let myalyceLogo = './assets/myalyce.png';
let personIcon = './assets/person.jpg';

state.subscribeEvent('route', (route:string) => {
    window.history.pushState(undefined, route, location.origin + route); //uhh
});
  
const TESTVIEWS = false //true; //skip login page (debug)

const brand = () => {
    return <img src={ myalyceLogo } width='100px' alt='MyAlyce'/>
};


//this allows this part of the app to re-render independently
class NavDrawerContainer extends sComponent {

    state = {
        navOpen: false,
    }

    render() {
        return (
            <NavDrawer fixed="left" zIndex={102} isOpen={this.state.navOpen} 
                brand={brand()} 
                onBackdropClick={() => this.setState({navOpen:false})} menuItems={[
                    { type: 'action', icon: 'H' as any, onClick: () => this.setState({   'route':'/',   navOpen:false}), title: 'Home' },
                    { type: 'action', icon: 'P' as any, onClick: () => this.setState({   'route':'/peers',       navOpen:false}), title: 'WebRTC' },
                    { type: 'action', icon: 'R' as any, onClick: () => this.setState({   'route':'/recordings',  navOpen:false}), title: 'Recordings' },
                    { type: 'action', icon: 'S' as any, onClick: () => this.setState({   'route':'/settings',       navOpen:false}), title: 'Settings' },
                    { type: 'action', icon: 'D' as any, onClick: () => this.setState({ 'route':'/dev',         navOpen:false}),      title: 'Developer Tools' },

                ]}
            /> 
        )
    }
}
  
//note we're using sComponent which has some extended functionality for a global state
export class App extends sComponent {

    state = {
        isLoggedIn: false,
        loggingIn:false, //show load screen
        route: '/'
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

    render() {
        return (
            <div>
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
                    <div>
                         <Header />
                         <Navigation />
                        <div id='viewcontent'>
                            <div id='route'>
                                { (this.state.route.includes('dashboard') || this.state.route === '/' || this.state.route === '') &&
                                    <Dashboard/>
                                }
                                { this.state.route.includes('peers') &&  <WebRTCComponent/>}
                                { this.state.route.includes('recordings') && <Recordings 
                                    dir={state.data.activeStream ? (webrtc.rtc[state.data.activeStream] as RTCCallInfo).firstName + (webrtc.rtc[state.data.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName}/>}
                                { this.state.route.includes('settings') && <SettingsView/> }
                                { this.state.route.includes('dev') && <Dev/>}
                            </div>
                        </div>
                    </div>
                }
            </div>
        )
    }
}