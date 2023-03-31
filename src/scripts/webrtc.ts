import { client, usersocket, webrtc } from "./client"
import { state, WebRTCInfo, WebRTCProps } from 'graphscript'//'../../../graphscript/index'//
//https://hacks.mozilla.org/2013/07/webrtc-and-the-ocean-of-acronyms/

const webrtcData = {
    webrtcStream:undefined, //current active stream
    availableStreams:webrtc.rtc as {[key:string]:WebRTCInfo}, //list of accepted calls
    unansweredCalls:webrtc.unanswered as {[key:string]:WebRTCProps & {caller:string, firstName?:string, lastName?: string}}
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
                        'runAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
                        [ //and pass these arguments
                            'receiveCallInformation', //run this function on the user's end
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
        // ondatachannel:(ev) => {
        //     //the call is now live, set ev.channel.onmessage function and add media tracks etc.
        // },
        // ontrack:(ev) => {
        //     //received a media track, e.g. audio or video
        // }
    });

    usersocket.post(
        'runConnection', //run this function on the backend router
        [
            userId, //run this connection 
            'postAll',  //use this function (e.g. run, post, subscribe, etc. see User type)
            [ //and pass these arguments
                'receiveCallInformation', //run this function on the user's end
                {
                    _id:rtcId, 
                    hostdescription:rtc.hostdescription, //the peer needs to accept this
                    caller:client.currentUser._id,
                    socketId:usersocket._id
                }
            ]
        ]
    );
}

//todo: need to grab the specific endpoint to respond to
export let answerCall = async (call:WebRTCProps & {caller:string, socketId:string}) => {
    let rtc = await webrtc.answerCall(call as any);
    
    usersocket.run(
        'runConnection', //run this function on the backend router
        [
            call.caller, //run this connection 
            'run',  //use this function (e.g. run, post, subscribe, etc. see User type)
            [ //and pass these arguments
                'answerPeer', //run this function on the user's end
                [
                    rtc._id,
                    {
                        peerdescription:rtc.peerdescription, //the host needs this
                        caller:client.currentUser._id,
                        socketId:usersocket._id,
                        firstName:client.currentUser.firstName,
                        lastName:client.currentUser.lastName
                    }
                ]
            ],
            call.socketId
        ]
    );

    state.setState({
        availableStreams:webrtc.rtc
    });
}

webrtc.subscribe('receiveCallInformation', (id) => {
    
    console.log('received call information:', id);

    state.setState({
        unansweredCalls:webrtc.unanswered
    }); //update this event for the app

});
