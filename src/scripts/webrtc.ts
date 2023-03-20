import { client, usersocket, webrtc } from "./client"
import { state } from 'graphscript'
//https://hacks.mozilla.org/2013/07/webrtc-and-the-ocean-of-acronyms/

const webrtcData = {
    webrtcStream:undefined, //current active stream
    availableStreams:{},
    unansweredCalls:{}
}

state.setState(webrtcData);

                
export async function startCall(userId) {
    //send handshake
    let rtcId = `room${Math.floor(Math.random()*1000000000000000)}`;
    
    let rtc = await webrtc.openRTC({ 
        _id:rtcId,
        onicecandidate:async (ev) => {
            if(ev.candidate) { //we need to pass our candidates to the other endpoint, then they need to accept the call and return their ice candidates
                let cid = `hostcandidate${Math.floor(Math.random()*1000000000000000)}`;
                usersocket.run(
                    'runConnection', //run this function on the backend router
                    [
                        userId, //run this connection 
                        'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
                        'receiveCallInformation', //run this function on the user's end
                        [ //and pass these arguments
                            {
                                _id:rtcId, 
                                hostcandidates:{[cid]:ev.candidate}
                            }
                        ]
                    ]
                ).then((id) => {
                    console.log('call information echoed from peer:', id);
                });
            }
        },
        ondatachannel:(ev) => {
            //the call is now live, add tracks
        },
        ontrack:(ev) => {
            //received a media track, e.g. audio or video
        }
    });

    usersocket.run(
        'runConnection', //run this function on the backend router
        [
            userId, //run this connection 
            'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
            'receiveCallInformation', //run this function on the user's end
            [ //and pass these arguments
                {
                    _id:rtcId, 
                    hostdescription:rtc.hostdescription, //the peer needs to accept this
                    caller:client.currentUser._id
                }
            ]
        ]
    );
    //usersocket.run('runConnection',[user._id, 'run', ''])
}


webrtc.subscribe('receiveCallInformation', (id) => {
    
    let callinfo = webrtc.unanswered[id];
    console.log('received call information:', id);

    state.setState({unansweredCalls:webrtc.unanswered}); //update this event for the app

});
