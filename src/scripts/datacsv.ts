import { workers } from "device-decoder";
import { state } from "./client";

import gsworker from './device.worker'

state.setState({
    isRecording:false,
    recordingPPG:false,
    recordingEMG:false,
    recordingIMU:false,
    recordingENV:false
});

let recordingSubs = {} as any;

let fileNames = {} as any;

export const csvworkers = {};

export function recordCSV(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[], subTitle?:string) { 

    
    csvworkers[streamId ? streamId+'emg' : 'emg'] =  workers.addWorker({ url: gsworker });
    csvworkers[streamId ? streamId+'ppg' : 'ppg'] =  workers.addWorker({ url: gsworker });
    csvworkers[streamId ? streamId+'hr' : 'hr'] =  workers.addWorker({ url: gsworker });
    csvworkers[streamId ? streamId+'breath' : 'breath'] =  workers.addWorker({ url: gsworker });
    csvworkers[streamId ? streamId+'imu' : 'imu'] =  workers.addWorker({ url: gsworker });
    csvworkers[streamId ? streamId+'env' : 'env'] =  workers.addWorker({ url: gsworker });
    //csvworkers[streamId ? streamId+'emg2' : 'emg2'] =  workers.addWorker({ url: gsworker })

    state.setState({isRecording:true});


    if(!sensors || sensors.includes('ppg')) {
        let makeCSV = () => {
            let filename = `data/PPG_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['ppg'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'ppg' : 'ppg']?.run('createCSV', [
                filename,
                [
                    'timestamp', 
                    'red', 'ir', 'max_dietemp'
                ],
                0,
                100
            ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
    }

    if(!sensors || !sensors.includes('breath')) {
        let makeCSV = () => {
            let filename = `data/BREATH_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['breath'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'breath' : 'breath']?.run('createCSV', [
                filename,
                [
                    'timestamp', 'breath', 'brv'
                ],
                0,
                100
            ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
    }

    if(!sensors || sensors.includes('hr')) {
        let makeCSV = () => {
            let filename = `data/HRV_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['hr'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'hr' : 'hr']?.run('createCSV', [
                filename,
                [
                    'timestamp', 'hr', 'hrv'
                ],
                0,
                100
            ]);
        }
        if(state.data[streamId ? streamId+'detectedPPG' : 'detectedPPG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedPPG' : 'detectedPPG', makeCSV);
    }

    if(!sensors || sensors?.includes('emg')) {
        let makeCSV = () => {
            let header = ['timestamp','0','1'];
            if(state.data[streamId ? streamId+'emg' : 'emg'].leds) {
                header.push('leds');
            }
            let filename = `data/EMG_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
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
    if(!sensors || sensors?.includes('ppg')) {
        recordingSubs[`${streamId ? streamId : ''}ppg`] = state.subscribeEvent(streamId ? streamId+'ppg' :'ppg', (ppg) => {
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].run('appendCSV',[ppg, fileNames['ppg']]);
        });
    }
    if(!sensors || sensors?.includes('hr')) {
        recordingSubs[`${streamId ? streamId : ''}hr`] = state.subscribeEvent(streamId ? streamId+'hr' :'hr', (hr) => {
            csvworkers[streamId ? streamId+'hr' : 'hr'].run('appendCSV',[hr,fileNames['hr']]);
        });
    }
    if(!sensors || sensors?.includes('breath')) {
        recordingSubs[`${streamId ? streamId : ''}breath`] = state.subscribeEvent(streamId ? streamId+'breath' :'breath', (breath) => {
            csvworkers[streamId ? streamId+'breath' : 'breath'].run('appendCSV',[breath,fileNames['breath']]);
        });
    }
    if(!sensors || sensors?.includes('imu')) {
        let makeCSV = () => {
            let filename = `data/IMU_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['imu'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'imu' : 'imu']?.run('createCSV', [
                filename,
                [
                    'timestamp',
                    'ax', 'ay', 'az', 'gx', 'gy', 'gz', 'mpu_dietemp'
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
            let filename = `data/ENV_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['env'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'env' : 'env']?.run('createCSV', [
                `data/ENV_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`,
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

export function stopRecording(streamId?:string) {
    state.setState({isRecording:false});
    
    if(`${streamId ? streamId : ''}emg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}emg`, recordingSubs[`${streamId ? streamId : ''}emg`]);
    }
    if(`${streamId ? streamId : ''}ppg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}ppg`, recordingSubs[`${streamId ? streamId : ''}ppg`]);
    }
    if(`${streamId ? streamId : ''}imu` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}imu`, recordingSubs[`${streamId ? streamId : ''}imu`]);
    }
    if(`${streamId ? streamId : ''}hr` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}hr`, recordingSubs[`${streamId ? streamId : ''}hr`]);
    }
    if(`${streamId ? streamId : ''}breath` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}breath`, recordingSubs[`${streamId ? streamId : ''}breath`]);
    }
    if(`${streamId ? streamId : ''}env` in recordingSubs) {
        state.unsubscribeEvent(`${streamId ? streamId : ''}env`, recordingSubs[`${streamId ? streamId : ''}env`]);
    }

    //now we need to calculate session averages, these are functions triggered on the threads

    //heartrate session average

    //breath session average

    if(streamId && csvworkers[streamId+'chat'] ) csvworkers[streamId+'chat'].terminate();
    csvworkers[streamId ? streamId+'emg' : 'emg']?.terminate();
    csvworkers[streamId ? streamId+'ppg' : 'ppg']?.terminate();
    csvworkers[streamId ? streamId+'hr' : 'hr']?.terminate();
    csvworkers[streamId ? streamId+'breath' : 'breath']?.terminate();
    csvworkers[streamId ? streamId+'imu' : 'imu']?.terminate();
    csvworkers[streamId ? streamId+'env' : 'env']?.terminate();
    //csvworkers[streamId ? streamId+'emg2' : 'emg2']?.terminate();
    
}