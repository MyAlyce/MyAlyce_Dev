import React from 'react'
import { sComponent } from '../state.component'
import { Col, Row } from 'react-bootstrap';

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
                <h3>Privacy: </h3>
                <p style={{wordWrap:'break-word'}}>
                The only personally identifying information collected by this app is your name and basic contact info into a secure MongoDB database, based on what you provide through the Google Login service. This will evolve but the backend is otherwise being designed for security and HIPAA & GDPR compliance and minimal risk, everything live is done clientside or peer-2-peer.
                <br/><br/>
                The goal with this platform is to create an entirely peer-2-peer or otherwise opt-in remote patient monitoring and biometric profiling system for home or clinical use. You decide exactly who can see you/connect to you over the web to see your streaming information, and we will evolve more complex permissions systems as we go. This gives users control over their data for their personal health needs and otherwise lend itself to easier population modeling with anonymized datasets able to be donated easily through the web. We should all be working on national datasets and humanistic logistics networks for mental and physical health, rather than using all this sophisticated data to figure out who will buy more stuff as the largest industries prefer to do. What future do you really want? What future can there even be without collective action toward more openness and mutual support?
                <br/><br/>
                We ultimately hope these tools will facilitate a collaborative and safe environment for health data research and education as there is a lot of work to be done, and the private sector hoards this stuff for all it's worth which is actively detrimental to a functioning innovation community that actually wants to see genuinely good outcomes for friends and family who may benefit from the technologies we work on. 
                </p>
                <hr/>
                <h3>License: </h3>
                <p>
                    The base for MyAlyce is AGPL v3.0 public domain free software built on the open web!
                </p>
            </div>
        );

    }
}