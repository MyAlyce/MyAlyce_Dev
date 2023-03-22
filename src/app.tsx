import React from 'react'
import {state} from 'graphscript'
import { sComponent } from './components/state.component';
import { login, logout } from './scripts/login';
import { client, onLogin, onLogout } from './scripts/client';
import { Login, Avatar, TopBar } from 'my-alyce-component-lib';
import { SettingsView } from './components/SettingsView';

//@ts-ignore
import {slide as Menu} from 'react-burger-menu'
import { WebRTCComponent } from './components/WebRTC';
import { Dashboard } from './components/Dashboard';
import { Recordings } from './components/Recordings';

state.subscribeEvent('route', (route:string) => {
    window.history.pushState(undefined, route, location.origin + route); //uhh
});
  

const TESTVIEWS = true; //skip login page (debug)

const brand = () => {
    return <img src="dist/assets/myalyce.png" width='100px' alt='MyAlyce'/>
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
                        useRegularLogin={true}
                        onLoginClick={this.onLoginClick}
                        thirdPartyLogins={[
                            {
                                name:'google',
                                logo:(<img src="dist/assets/google.png" width="50px"></img>),
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
                        {/* <NavDrawer fixed="left" zIndex={102} isOpen={this.state.navOpen} 
                            brand={brand()} 
                            onBackdropClick={() => this.setState({navOpen:false})} menuItems={[
                                { type: 'action', icon: 'D' as any, onClick: () => this.setState({'route':'/dashboard', navOpen:false}), title: 'Dashboard' },
                                { type: 'action', icon: 'P' as any, onClick: () => this.setState({'route':'/peers',     navOpen:false}), title: 'Peers & Groups' },
                                { type: 'action', icon: 'S' as any, onClick: () => this.setState({'route':'/settings',  navOpen:false}), title: 'Profile Settings' },
                                { type: 'action', icon: 'D' as any, onClick: () => this.setState({'route':'/dev',  navOpen:false}),      title: 'DEV MODE' }
                            ]}
                        />  */}
                    <div id="view">
                      <TopBar zIndex={0} onMenuExpand={() => {
                            let open = !this.state.navOpen;
                            this.setState({'navOpen':open})
                          }} 
                          rightNavItems={[
                            {
                                children:<Avatar
                                  dataState='done'
                                  imgSrc='src/assets/person.png'
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
                                children:(<p style={{fontSize:'16px'}}>logout</p>),
                                onClick:()=>{}
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
                                    <SettingsView/>
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