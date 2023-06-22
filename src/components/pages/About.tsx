import React from 'react'
import { sComponent } from '../state.component'
import { Col, Row } from 'react-bootstrap';
import { Privacy } from '../modules/Privacy';

export class About extends sComponent {

    render() {
        return (
            <div>
                <h1><Row className="mx-auto my-auto"><Col className="mx-auto my-auto">About  <img style={{transform:"translateY(-8px)", padding:"5px", paddingBottom:'10px', backgroundColor:"black", borderRadius:'5px'}} src="./assets/myalyce.png" height="50px"></img></Col></Row></h1>
                <hr/>
                <h3>Server Notice</h3>
                <p style={{wordWrap:'break-word'}}>
                    We are creating a biometric dashboard and data collection system in-browser and on mobile. This will become a comprehensive tool as development progresses but right now it is simplistic.
                    <br/><br/>
                    This software is INCOMPLETE! Just look at how awful this page looks! We are in a pre-alpha tech testing phase. The only data being collected by our database are your event logs, which will not be used for anything without your consent. 
                    <br/><br/>
                    We'll have more tools later so you can wipe your account, this is a development server so things are being reset often.
                </p>
                <h3>Contact: </h3>
                <p>
                    <h4>Joshua Brewster, lead developer:</h4> 
                    joshuab@myalyce.com
                    <br/><br/> 
                    <h4>Alex Shohet, cofounder:</h4> 
                    alexs@myalyce.com
                    <br/><br/>
                    <h4>Sponsored by the Evergreen Fund</h4>
                    <a href="https://evergreenfund.life">Home</a>
                </p>
                <hr/>
                <Privacy/>
                <h3>License: </h3>
                <p>
                    The base for MyAlyce is AGPL v3.0 public domain free software built on the open web!
                </p>
            </div>
        );

    }
}