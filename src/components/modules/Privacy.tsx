import React from 'react'


export function Privacy() {
    return (<>
    <h3>Privacy: </h3>
    <p style={{wordWrap:'break-word'}}>
    The only personally identifying information collected by this app is your name and basic contact info into a secure MongoDB database, based on what you provide through the Google Login service. This will evolve but the backend is otherwise being designed for security and HIPAA & GDPR compliance and minimal risk, everything live is done clientside or peer-2-peer.
    <br/><br/>
    The goal with this platform is to create an entirely peer-2-peer or otherwise opt-in remote patient monitoring and biometric profiling system for home or clinical use. You decide exactly who can see you/connect to you over the web to see your streaming information, and we will evolve more complex permissions systems as we go. This gives users control over their data for their personal health needs and otherwise lend itself to easier population modeling with anonymized datasets able to be donated easily through the web. We should all be working on national datasets and humanistic logistics networks for mental and physical health, rather than using all this sophisticated data to figure out who will buy more stuff as the largest industries prefer to do. What future do you really want? What future can there even be without collective action toward more openness and mutual support?
    <br/><br/>
    We ultimately hope these tools will facilitate a collaborative and safe environment for health data research and education as there is a lot of work to be done, and the private sector hoards this stuff for all it's worth which is actively detrimental to a functioning innovation community that actually wants to see genuinely good outcomes for friends and family who may benefit from the technologies we work on. 
    </p>
    <hr/>
    </>)
}