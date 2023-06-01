import React from 'react';
import { sComponent } from '../state.component';
import Button from 'react-bootstrap/Button';
import { showNotification } from '../../scripts/alerts'
import { client, logoutSequence } from '../../scripts/client';
import { FriendsModal } from './FriendsModal';
import * as Icon from 'react-feather';

let myalyceLogo = './assets/myalyce.png';

export class Header extends sComponent {

    state={
        isLoggedIn:false
    }

    friendsListOpen = false;

    render() {
         //header with logo, notifications, login status
        return(
            <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow" id={this.unique+'header'}>
                 <a className="col-md-3 col-lg-2 me-0 px-3 fs-6" href="#"><img className="img-fluid" width="120" alt="myAlyce" src={myalyceLogo} /></a>
                 <Icon.Bell className="align-text-bottom" color="white" size={30}></Icon.Bell>
                 <FriendsModal />
                 <Icon.User className="align-text-bottom" color="white" size={30} onClick={()=>{
                    this.friendsListOpen = !this.friendsListOpen;
                    if(this.friendsListOpen) {
                        
                    } else {
                        
                    }
                 }}></Icon.User>
                 <div className="navbar-nav">
                     <div className="nav-item text-nowrap">
                     {this.state.isLoggedIn ? <a className="nav-link px-3" onClick={()=>{ logoutSequence(); }}>
                        <img className="rounded-circle" width="40" alt={client.currentUser.firstName} src={client.currentUser.pictureUrl} /> Sign out </a> : 
                        <Button onClick={()=>{ this.setState({isLoggedIn:false}); /** This will kick us back to the login page */}}> 
                            Sign In 
                        </Button> }
                     </div>
                 </div>
             </header>
         )
    }
}
