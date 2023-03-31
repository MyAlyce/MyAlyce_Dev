import React from 'react'
import {state} from 'graphscript'//'../../graphscript/index'//
import { sComponent } from './components/state.component';
import { login, logout } from './scripts/login';
import { client, onLogin, onLogout } from './scripts/client';
import { Login, Avatar, TopBar, NavDrawer } from 'my-alyce-component-lib';
import { SettingsView } from './components/SettingsView';

//@ts-ignore
import {slide as Menu} from 'react-burger-menu'
import { WebRTCComponent } from './components/WebRTC';
import { Dashboard } from './components/Dashboard';
import { Recordings } from './components/Recordings';
import { Device } from './components/Device';

let googleLogo = './assets/google.png'
let myalyceLogo = './assets/myalyce.png'
let personIcon = './assets/person.jpg'

state.subscribeEvent('route', (route:string) => {
    window.history.pushState(undefined, route, location.origin + route); //uhh
});
  

const TESTVIEWS = false //true; //skip login page (debug)

const brand = () => {
    return <img src={myalyceLogo} width='100px' alt='MyAlyce'/>
};
  
//note we're using sComponent which has some extended functionality for a global state
export class App extends sComponent {

    state = {
        isLoggedIn: false,
        navOpen: false,
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
                        <Menu>
                            <button onClick={() => {this.setState({'route':'/dashboard', navOpen:false})}} id="home" className="menu-item">Dash</button>
                            <button onClick={() => this.setState({'route':'/peers',     navOpen:false})} className="menu-item">Peers</button>
                            <button onClick={() => this.setState({'route':'/history',  navOpen:false})} className="menu-item" >History</button>
                            <button onClick={() => this.setState({'route':'/device',  navOpen:false})} className="menu-item--small">Device</button>
                        </Menu>
                        <NavDrawer fixed="left" zIndex={102} isOpen={this.state.navOpen} 
                            brand={brand()} 
                            onBackdropClick={() => this.setState({navOpen:false})} menuItems={[
                                { type: 'action', icon: 'D' as any, onClick: () => this.setState({'route':'/dashboard', navOpen:false}), title: 'Dashboard' },
                                { type: 'action', icon: 'P' as any, onClick: () => this.setState({'route':'/peers',     navOpen:false}), title: 'Peers & Groups' },
                                { type: 'action', icon: 'S' as any, onClick: () => this.setState({'route':'/settings',  navOpen:false}), title: 'Profile Settings' },
                                { type: 'action', icon: 'D' as any, onClick: () => this.setState({'route':'/dev',  navOpen:false}),      title: 'DEV MODE' }
                            ]}
                        /> 
                    <div id="view">
                      <TopBar zIndex={0} onMenuExpand={() => {
                            let open = !this.state.navOpen;
                            this.setState({'navOpen':open})
                          }} 

                          style={{
                            position:'sticky',
                            top:0,
                            left:0,
                          }}
                          rightNavItems={[
                            {
                                children:<Avatar
                                  dataState='done'
                                  imgSrc={client.currentUser.pictureUrl ? client.currentUser.pictureUrl : {personIcon}}
                                  size='xs'
                                  status='online'
                                  name={
                                      {
                                          first:client.currentUser?.firstName as string,
                                          last:client.currentUser?.lastName as string,
                                      }
                                  }
                                  backgroundColor='lightblue'
                                />,
                                onClick:()=>{}                                
                            },
                            {
                                children:(<p style={{
                                    fontSize:'16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                }}>Logout</p>),
                                onClick:()=>{this.logout()}
                            }
                            ]}  
                        /> 
                        <div id='viewcontent'>
                            <div id='route'>
                                { (this.state.route.includes('dashboard') || this.state.route === '/' || this.state.route === '') &&
                                    <Dashboard/>
                                }
                                { this.state.route.includes('peers') &&
                                    <WebRTCComponent/>
                                }
                                { this.state.route.includes('settings') &&
                                    <Recordings/>
                                }
                                { this.state.route.includes('device') &&
                                    <Device/>
                                }
                            </div>
                        </div>
                  </div> 
                </div>
                }
            </div>
        )
    }
}