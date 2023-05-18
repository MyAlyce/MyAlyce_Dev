import React from 'react';
import Button from 'react-bootstrap/Button';
import { showNotification } from '../../scripts/alerts'
let myalyceLogo = './assets/myalyce.png';
let profilePic = './assets/JoshBrew.jpg';


export function Header (){
    //header with logo, notifications, login status
    return(
       <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
            <a className="col-md-3 col-lg-2 me-0 px-3 fs-6" href="#"><img className="img-fluid" width="120" alt="myAlyce" src={myalyceLogo} /></a>
             <Button variant="outline-light"onClick={()=>{showNotification("Hello World","Exmaple Notification")}}>Notifications</Button>{' '}
            <div className="navbar-nav">
                <div className="nav-item text-nowrap">
                <a className="nav-link px-3" href="#"><img className="rounded-circle" width="40" alt="Josh" src={profilePic} /> Sign out </a>
                </div>
            </div>
        </header>
    )
}