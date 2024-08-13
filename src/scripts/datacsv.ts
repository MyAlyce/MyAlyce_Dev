import { workers } from "device-decoder";
import { alerts, client, state } from "./client";
import { webrtc } from './client'

import gsworker from './device.worker'
import { RTCCallInfo } from "./webrtc";
import { WorkerInfo } from "graphscript-workers";
import { parseCSVData, toISOLocal } from "graphscript-services.storage";

state.setState({
    isRecording:false,
    recordingPPG:false,
    recordingEMG:false,
    recordingIMU:false,
    recordingENV:false
});

let recordingSubs = {} as any;

let fileNames = {} as any;

export const csvworkers = {} as {[key:string]:WorkerInfo};

export function recordAlert(alert:{message:string,timestamp:number, value:any, from:string, [key:string]:any}, streamId?) {

    const workername = streamId ? streamId+'alerts' : 'alerts';
    
    //if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) {
        if(!csvworkers[workername]) {
            csvworkers[workername] =  workers.addWorker({ url: gsworker });
            csvworkers[workername].run('createCSV', [
                `${alert.from}/Alerts_${alert.from}.csv`,
                [
                    'timestamp','message','value','from'
                ]
            ]);
        }
        csvworkers[workername].run('appendCSV',alert);
    //}

}


export const recordEvent = (from, event, streamId?) => {
    const name = streamId ? streamId+'events' : 'events';
    
    //if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) {
        if(!csvworkers[name]) {
            csvworkers[name] =  workers.addWorker({ url: gsworker });
            csvworkers[name].run('createCSV', [
                `${from}/Events_${from}.csv`,
                [
                    'timestamp','from', 'event', 'notes', 'grade', 'value', 'units', 'location', 'startTime', 'endTime'
                ]
            ]);
        }
        csvworkers[name].run('appendCSV', event);
    //}

    state.setValue(streamId ? streamId+'event' : 'event', event);
}

export const recordChat = (from,message,streamId?) => {
    const name = streamId ? streamId+'chat' : 'chat';
    if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) {
        if(!csvworkers[name]) {
            csvworkers[name] =  workers.addWorker({ url: gsworker });
            csvworkers[name].run('createCSV', [
                `${from}/Chat_${from}${toISOLocal(Date.now())}.csv`,
                [
                    'timestamp','from','message'
                ]
            ]);
        }
        csvworkers[name].run('appendCSV', message)
    }
}



export function recordCSV(
    streamId?:string, 
    sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[], 
    subTitle?:string, 
    dir='data'
) { 
    if(!sensors || sensors.includes('emg')) csvworkers[streamId ? streamId+'emg' : 'emg'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('ecg')) csvworkers[streamId ? streamId+'ecg' : 'ecg'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('ppg')) csvworkers[streamId ? streamId+'ppg' : 'ppg'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('hr')) csvworkers[streamId ? streamId+'hr' : 'hr'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('breath')) csvworkers[streamId ? streamId+'breath' : 'breath'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('imu')) csvworkers[streamId ? streamId+'imu' : 'imu'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('env')) csvworkers[streamId ? streamId+'env' : 'env'] =  workers.addWorker({ url: gsworker });
    //csvworkers[streamId ? streamId+'emg2' : 'emg2'] =  workers.addWorker({ url: gsworker })

    state.setState({[streamId ? streamId + 'isRecording' : 'isRecording']:true});

    if(!sensors || sensors.includes('ppg')) {
        let makeCSV = () => {
            let filename = dir+`/PPG_${subTitle ? subTitle : streamId ? '_'+streamId : ''}${toISOLocal(Date.now())}.csv`;
            fileNames['ppg'] = filename;
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'ppg' : 'ppg']?.run(
                'createCSV', [
                filename,
                [
                    'timestamp', 
                    'red', 'ir'
                ],
                0,
                100
            ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}ppg`] = state.subscribeEvent(streamId ? streamId+'ppg' :'ppg', (ppg) => {
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].post(
                'appendCSV',[ppg, fileNames['ppg']]);
        });
    }

    if(!sensors || sensors.includes('breath')) {
        let makeCSV = () => {
            let filename =  dir+`/BRE_${subTitle ? subTitle : streamId ? '_'+streamId : ''}${toISOLocal(Date.now())}.csv`;
            fileNames['breath'] = filename;
            
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'breath' : 'breath']?.run(
                'createCSV', [
                filename,
                    [
                        'timestamp', 'breath', 'brv'
                    ],
                    3,
                    0
                ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}breath`] = state.subscribeEvent(streamId ? streamId+'breath' :'breath', (breath) => {
            csvworkers[streamId ? streamId+'breath' : 'breath'].post(
                'appendCSV',[breath, fileNames['breath']]
            );
        });
    }

    if(!sensors || sensors.includes('hr')) {
        let makeCSV = () => {
            let filename =  dir+`/HRV_${subTitle ? subTitle : streamId ? '_'+streamId : ''}${toISOLocal(Date.now())}.csv`;
            fileNames['hr'] = filename;
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'hr' : 'hr']?.run('createCSV', [
                    filename,
                    [
                        'timestamp', 'hr', 'hrv'
                    ],
                    3,
                    0
                ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}hr`] = state.subscribeEvent(streamId ? streamId+'hr' : 'hr', (hr) => {
            csvworkers[streamId ? streamId+'hr' : 'hr'].post(
                'appendCSV',[hr, fileNames['hr']]
            );
        });
    }


    if(!sensors || sensors.includes('emg')) {
        let makeCSV = () => {
            let header = ['timestamp','0','1','2','3','4'];
            // if(state.data[streamId ? streamId+'emg' : 'emg'].leds) {
            //     header.push('leds');
            // }
            let filename =  dir+`/EMG_${subTitle ? subTitle : streamId ? '_'+streamId : ''}${toISOLocal(Date.now())}.csv`;
            fileNames['emg'] = filename;
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'emg' : 'emg']?.run(
                'createCSV', [
                    filename,
                    header,
                    5,
                    250
                ]);
        }
        if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}emg`] = state.subscribeEvent(streamId ? streamId+'emg' : 'emg', (data) => {
            csvworkers[streamId ? streamId+'emg' : 'emg'].post(
                'appendCSV',[data, fileNames['emg']]
            );
        });
    }

    if(!sensors || sensors.includes('ecg')) {
        let makeCSV = () => {
            let header = ['timestamp','5'];
            // if(state.data[streamId ? streamId+'emg' : 'emg'].leds) {
            //     header.push('leds');
            // }
            let filename =  dir+`/ECG_${subTitle ? subTitle : streamId ? '_'+streamId : ''}${toISOLocal(Date.now())}.csv`;
            fileNames['ecg'] = filename;
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'ecg' : 'ecg']?.run(
                'createCSV', [
                    filename,
                    header,
                    5,
                    250
                ]);
        }
        if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}ecg`] = state.subscribeEvent(streamId ? streamId+'emg' : 'emg', (data) => {
            csvworkers[streamId ? streamId+'ecg' : 'ecg'].post(
                'appendCSV',[data, fileNames['ecg']]
            );
        });
    }

    if(!sensors || sensors?.includes('imu')) {
        let makeCSV = () => {
            let filename =  dir+`/IMU_${subTitle ? subTitle : streamId ? '_'+streamId : ''}${toISOLocal(Date.now())}.csv`;
            fileNames['imu'] = filename;
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'imu' : 'imu']?.run(
                'createCSV', [
                    filename,
                    [
                        'timestamp',
                        'ax', 'ay', 'az', 'gx', 'gy', 'gz'
                    ],
                    0,
                    100
                ]);
        }
        if(state.data[streamId ? streamId+'detectedIMU' : 'detectedIMU']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedIMU' : 'detectedIMU', makeCSV);
        
        recordingSubs[`${streamId ? streamId : ''}imu`] = state.subscribeEvent(streamId ? streamId+'imu' :'imu', (imu) => {
            csvworkers[streamId ? streamId+'imu' : 'imu'].post(
                'appendCSV',[imu,fileNames['imu']]
            );
        });
    }

    if(!sensors || sensors?.includes('env')) {
        let makeCSV = () => {
            let filename =  dir+`/ENV_${toISOLocal(Date.now())}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['env'] = filename;
            if(state.data[streamId ? streamId + 'isRecording' : 'isRecording']) 
                csvworkers[streamId ? streamId+'env' : 'env']?.run(
                'createCSV', [
                    filename,
                    [
                        'timestamp',
                        'temperature', 'pressure', 'humidity', 'altitude'
                    ],
                    4
                ]);
        }
        if(state.data[streamId ? streamId+'detectedENV' : 'detectedENV']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedENV' : 'detectedENV', makeCSV);
        
        recordingSubs[`${streamId ? streamId : ''}env`] = state.subscribeEvent(streamId ? streamId+'env' :'env', (env) => {
            csvworkers[streamId ? streamId+'env' : 'env'].post(
                'appendCSV', [env,fileNames['env']]
            );
        });
    }
}

export async function stopRecording(streamId?:string, dir='data', folderListDir='data') {
    state.setState({[streamId ? streamId + 'isRecording' : 'isRecording']:false});

    let promises = [] as any[];

    let name;
    if(streamId) {
        let ses = webrtc.rtc[streamId] as RTCCallInfo;
        if(ses) {
            name = ses.firstName + '_' + ses.lastName;
        }
    } else if(client.currentUser?.firstName) {
        name = client.currentUser.firstName + '_' + client.currentUser.lastName;
    }
    
    if(`${streamId ? streamId : ''}emg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}emg`, recordingSubs[`${streamId ? streamId : ''}emg`]);
    }
    if(`${streamId ? streamId : ''}ecg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}emg`, recordingSubs[`${streamId ? streamId : ''}ecg`]);
    }
    if(`${streamId ? streamId : ''}ppg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}ppg`, recordingSubs[`${streamId ? streamId : ''}ppg`]);
    }
    if(`${streamId ? streamId : ''}hr` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}hr`, recordingSubs[`${streamId ? streamId : ''}hr`]);
        
        let filename1 = dir+'/HRV_Session';
        
        if(streamId) {
            let ses = webrtc.rtc[streamId] as RTCCallInfo;
            if(ses) {
                filename1 += '_' + name;
            }
        } else if(client.currentUser?.firstName) {
            filename1 += '_' + name;
        }

        csvworkers[streamId ? streamId+'hrses' : 'hrses'] =  workers.addWorker({ url: gsworker });
        promises.push(csvworkers[streamId ? streamId+'hrses' : 'hrses'].run('processHRSession',[fileNames['hr'],filename1]));

    }
    if(`${streamId ? streamId : ''}breath` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}breath`, recordingSubs[`${streamId ? streamId : ''}breath`]);

          
        let filename2 = dir+'/Breathing_Session';
        
        if(streamId) {
            let ses = webrtc.rtc[streamId] as RTCCallInfo;
            if(ses) {
                filename2 += '_' + name;
            }
        } else if(client.currentUser?.firstName) {
            filename2 += '_' + name;
        }

        csvworkers[streamId ? streamId+'brses' : 'brses'] =  workers.addWorker({ url: gsworker });
        promises.push(csvworkers[streamId ? streamId+'brses' : 'brses'].run('processBRSession',[fileNames['breath'],filename2]));
    }
    if(`${streamId ? streamId : ''}imu` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}imu`, recordingSubs[`${streamId ? streamId : ''}imu`]);
    }
    if(`${streamId ? streamId : ''}env` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}env`, recordingSubs[`${streamId ? streamId : ''}env`]);
    }

    //heartrate session average
    if(promises.length > 0) await Promise.all(promises);

    let tempworker = workers.addWorker({ url: gsworker });
    await tempworker.run('checkFolderList',[folderListDir+'/folderList', name]);

    csvworkers[streamId+'chat']?.terminate();
    csvworkers[streamId ? streamId+'emg' : 'emg']?.terminate();
    csvworkers[streamId ? streamId+'ecg' : 'ecg']?.terminate();
    csvworkers[streamId ? streamId+'ppg' : 'ppg']?.terminate();
    csvworkers[streamId ? streamId+'hr' : 'hr']?.terminate();
    csvworkers[streamId ? streamId+'breath' : 'breath']?.terminate();
    csvworkers[streamId ? streamId+'imu' : 'imu']?.terminate();
    csvworkers[streamId ? streamId+'env' : 'env']?.terminate();
    //csvworkers[streamId ? streamId+'emg2' : 'emg2']?.terminate();
    
    csvworkers[streamId ? streamId+'hrses' : 'hrses']?.terminate();
    csvworkers[streamId ? streamId+'brses' : 'brses']?.terminate();

    //breath session average

}





