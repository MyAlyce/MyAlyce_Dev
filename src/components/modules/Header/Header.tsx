import React from 'react';
import { sComponent } from '../../state.component';
import Button from 'react-bootstrap/Button';
import { showNotification } from '../../../scripts/alerts'
import { client, logoutSequence } from '../../../scripts/client';
import { FriendsModal } from '../User/FriendsModal';
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
            <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap py-2 shadow my-auto" style={{paddingLeft:'10px', paddingRight:'5px'}} id={this.unique+'header'}>
                 <span><img className="img-fluid" width="120" alt="myAlyce" src={myalyceLogo} /><br/><span style={{color:'white'}}>Development Test</span></span>
                 {/* <Icon.Bell className="align-text-bottom" color="white" size={30}></Icon.Bell> */}
                 <FriendsModal />
                 <div className="navbar-nav hoverdiv" style={{borderRadius:'10px'}}>
                     <div className="nav-item text-nowrap">
                     {this.state.isLoggedIn ? <a style={{cursor:'pointer'}} className="nav-link px-3" onClick={()=>{ logoutSequence(); }}>
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
