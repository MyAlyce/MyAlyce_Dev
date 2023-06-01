
import { webrtc } from './webrtc'

export function recordAlert(alert:{message:string,timestamp:number, value:any, [key:string]:any}, streamId?) {

    let from;
    if(streamId) {
        const call = webrtc.rtc[streamId];
        from = (call as RTCCallInfo).firstName + (call as RTCCallInfo).lastName;
    } else {
        from = client.currentUser.firstName + client.currentUser.lastName;
    }

    alert.from = from;
    alerts.push(alert as any);

    const workername = streamId ? streamId+'alerts' : 'alerts';
    
    //if(state.data.isRecording) {
        if(!csvworkers[workername]) {
            csvworkers[workername] =  workers.addWorker({ url: gsworker });
            csvworkers[workername].run('createCSV', [
                `${from}/Alerts_${from}.csv`,
                [
                    'timestamp','message','value','from'
                ]
            ]);
        }
        csvworkers[workername].run('appendCSV',alert);
    //}

    state.setValue(streamId ? streamId+'alert' : 'alert', alert);

}
