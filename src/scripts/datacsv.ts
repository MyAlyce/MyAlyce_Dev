import { workers } from "device-decoder";
import { client, state, webrtc } from "./client";

import gsworker from './device.worker'
import { RTCCallInfo } from "./webrtc";
import { WorkerInfo } from "graphscript";

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

export function recordCSV(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[], subTitle?:string, dir='data') { 

    
    if(!sensors || sensors.includes('emg')) csvworkers[streamId ? streamId+'emg' : 'emg'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('ecg')) csvworkers[streamId ? streamId+'ecg' : 'ecg'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('ppg')) csvworkers[streamId ? streamId+'ppg' : 'ppg'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('hr')) csvworkers[streamId ? streamId+'hr' : 'hr'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('breath')) csvworkers[streamId ? streamId+'breath' : 'breath'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('imu')) csvworkers[streamId ? streamId+'imu' : 'imu'] =  workers.addWorker({ url: gsworker });
    if(!sensors || sensors.includes('env')) csvworkers[streamId ? streamId+'env' : 'env'] =  workers.addWorker({ url: gsworker });
    //csvworkers[streamId ? streamId+'emg2' : 'emg2'] =  workers.addWorker({ url: gsworker })

    state.setState({isRecording:true});


    if(!sensors || sensors.includes('ppg')) {
        let makeCSV = () => {
            let filename = dir+`/PPG_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['ppg'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'ppg' : 'ppg']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].run('appendCSV',[ppg, fileNames['ppg']]);
        });
    }

    if(!sensors || sensors.includes('breath')) {
        let makeCSV = () => {
            let filename =  dir+`/BREATH_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['breath'] = filename;
            
            if(state.data.isRecording) csvworkers[streamId ? streamId+'breath' : 'breath']?.run('createCSV', [
                filename,
                [
                    'timestamp', 'breath', 'brv'
                ],
                3,
                100
            ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}breath`] = state.subscribeEvent(streamId ? streamId+'breath' :'breath', (breath) => {
            csvworkers[streamId ? streamId+'breath' : 'breath'].run('appendCSV',[breath, fileNames['breath']]);
        });
    }

    if(!sensors || sensors.includes('hr')) {
        let makeCSV = () => {
            let filename =  dir+`/HRV_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['hr'] = filename;
            console.log('MAKE CSV:',filename);
            if(state.data.isRecording) csvworkers[streamId ? streamId+'hr' : 'hr']?.run('createCSV', [
                filename,
                [
                    'timestamp', 'hr', 'hrv'
                ],
                3,
                100
            ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}hr`] = state.subscribeEvent(streamId ? streamId+'hr' : 'hr', (hr) => {
            csvworkers[streamId ? streamId+'hr' : 'hr'].run('appendCSV',[hr, fileNames['hr']]);
        });
    }


    if(!sensors || sensors.includes('emg')) {
        let makeCSV = () => {
            let header = ['timestamp','0','1','2','3','4'];
            if(state.data[streamId ? streamId+'emg' : 'emg'].leds) {
                header.push('leds');
            }
            let filename =  dir+`/EMG_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['emg'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'emg' : 'emg']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'emg' : 'emg'].run('appendCSV',[data, fileNames['emg']]);
        });
    }

    if(!sensors || sensors.includes('ecg')) {
        let makeCSV = () => {
            let header = ['timestamp','5'];
            if(state.data[streamId ? streamId+'emg' : 'emg'].leds) {
                header.push('leds');
            }
            let filename =  dir+`/ECG_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['ecg'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'ecg' : 'ecg']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'ecg' : 'ecg'].run('appendCSV',[data, fileNames['ecg']]);
        });
    }

    if(!sensors || sensors?.includes('imu')) {
        let makeCSV = () => {
            let filename =  dir+`/IMU_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['imu'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'imu' : 'imu']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'imu' : 'imu'].run('appendCSV',[imu,fileNames['imu']]);
        });
    }

    if(!sensors || sensors?.includes('env')) {
        let makeCSV = () => {
            let filename =  dir+`/ENV_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['env'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'env' : 'env']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'env' : 'env'].run('appendCSV', [env,fileNames['env']]);
        });
    }
}

export async function stopRecording(streamId?:string, dir='data') {
    state.setState({isRecording:false});
    
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
    }
    if(`${streamId ? streamId : ''}breath` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}breath`, recordingSubs[`${streamId ? streamId : ''}breath`]);
    }
    if(`${streamId ? streamId : ''}imu` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}imu`, recordingSubs[`${streamId ? streamId : ''}imu`]);
    }
    if(`${streamId ? streamId : ''}env` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}env`, recordingSubs[`${streamId ? streamId : ''}env`]);
    }

    //now we need to calculate session averages, these are functions triggered on the threads

    let filename1 = dir+'/HRV_Session';
    let filename2 = dir+'/Breathing_Session';
    
    if(streamId) {
        let ses = webrtc.rtc[streamId] as RTCCallInfo;
        if(ses) {
            filename1 += '_' + ses.firstName + '_' + ses.lastName;
            filename2 += '_' + ses.firstName + '_' + ses.lastName;
        }
    } else if(client.currentUser?.firstName) {
        filename1 += '_' + client.currentUser.firstName + '_' + client.currentUser.lastName;
        filename2 += '_' + client.currentUser.firstName + '_' + client.currentUser.lastName;
    }

    //heartrate session average
    await Promise.all([
        csvworkers[streamId ? streamId+'hr' : 'hr']?.run('processHRSession',[fileNames['hr'],filename1]),
        csvworkers[streamId ? streamId+'breath' : 'breath']?.run('processBRSession',[fileNames['breath'],filename2])
    ]).then(() => {

        csvworkers[streamId+'chat']?.terminate();
        csvworkers[streamId ? streamId+'emg' : 'emg']?.terminate();
        csvworkers[streamId ? streamId+'ppg' : 'ppg']?.terminate();
        csvworkers[streamId ? streamId+'hr' : 'hr']?.terminate();
        csvworkers[streamId ? streamId+'breath' : 'breath']?.terminate();
        csvworkers[streamId ? streamId+'imu' : 'imu']?.terminate();
        csvworkers[streamId ? streamId+'env' : 'env']?.terminate();
        //csvworkers[streamId ? streamId+'emg2' : 'emg2']?.terminate();
    });

    //breath session average

    
}