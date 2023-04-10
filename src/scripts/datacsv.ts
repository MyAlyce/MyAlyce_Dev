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

const csvworkers = {}

export function recordCSV(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[]) { 

    
    csvworkers[streamId ? streamId+'emg' : 'emg'] =  workers.default.addWorker({ url: gsworker }),
    csvworkers[streamId ? streamId+'ppg' : 'ppg'] =  workers.default.addWorker({ url: gsworker }),
    csvworkers[streamId ? streamId+'imu' : 'imu'] =  workers.default.addWorker({ url: gsworker }),
    csvworkers[streamId ? streamId+'env' : 'env'] =  workers.default.addWorker({ url: gsworker }),
    //csvworkers[streamId ? streamId+'emg2' : 'emg2'] =  workers.default.addWorker({ url: gsworker })

    state.setState({isRecording:true});

    if(!sensors || sensors.includes('ppg') || sensors.includes('breath') || sensors.includes('hr')) {
        let makeCSV = () => {
            if(state.data.isRecording) csvworkers[streamId ? streamId+'emg' : 'emg']?.run('createCSV', [
                `data/PPG_${new Date().toISOString()}${streamId ? '_'+streamId : ''}.csv`,
                [
                    'timestamp',
                    'red', 'ir', 'hr', 'spo2', 'breath', 'max_dietemp'
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
            if(state.data.isRecording) csvworkers[streamId ? streamId+'emg' : 'emg']?.run('createCSV', [
                `data/EMG_${new Date().toISOString()}${streamId ? '_'+streamId : ''}.csv`,
                [
                    'timestamp',
                    '0', '1' //only record the first two channels for now (so much data!!)
                ],
                5,
                250
            ]);
        }
        if(state.data[streamId ? streamId+'detectedEMG' : 'detectedEMG']) {
            makeCSV();
        } else state.subscribeEventOnce(streamId ? streamId+'detectedEMG' : 'detectedEMG', makeCSV);
        recordingSubs[`${streamId ? streamId : ''}emg`] = state.subscribeEvent(streamId ? streamId+'emg' : 'emg', (data) => {
            csvworkers[streamId ? streamId+'emg' : 'emg'].run('appendCSV',data);
        })
    }
    if(!sensors || sensors?.includes('ppg')) {
        recordingSubs[`${streamId ? streamId : ''}ppg`] = state.subscribeEvent(streamId ? streamId+'ppg' :'ppg', (ppg) => {
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].run('appendCSV',ppg);
        })
    }
    if(!sensors || sensors?.includes('hr')) {
        recordingSubs[`${streamId ? streamId : ''}hr`] = state.subscribeEvent(streamId ? streamId+'hr' :'hr', (hr) => {
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].run('appendCSV',hr);
        })
    }
    if(!sensors || sensors?.includes('imu')) {
        let makeCSV = () => {
            if(state.data.isRecording) csvworkers[streamId ? streamId+'imu' : 'imu']?.run('createCSV', [
                `data/IMU_${new Date().toISOString()}${streamId ? '_'+streamId : ''}.csv`,
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
            csvworkers[streamId ? streamId+'imu' : 'imu'].run('appendCSV',imu);
        })
    }
    if(!sensors || sensors?.includes('breath')) {
        recordingSubs[`${streamId ? streamId : ''}breath`] = state.subscribeEvent(streamId ? streamId+'breath' :'breath', (breath) => {
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].run('appendCSV',breath);
        })
    }
    if(!sensors || sensors?.includes('env')) {
        let makeCSV = () => {
            if(state.data.isRecording) csvworkers[streamId ? streamId+'env' : 'env']?.run('createCSV', [
                `data/ENV_${new Date().toISOString()}${streamId ? '_'+streamId : ''}.csv`,
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
            csvworkers[streamId ? streamId+'env' : 'env'].run('appendCSV',env);
        })
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

    csvworkers[streamId ? streamId+'emg' : 'emg'].terminate();
    csvworkers[streamId ? streamId+'ppg' : 'ppg'].terminate();
    csvworkers[streamId ? streamId+'imu' : 'imu'].terminate();
    csvworkers[streamId ? streamId+'env' : 'env'].terminate();
    //csvworkers[streamId ? streamId+'emg2' : 'emg2'].terminate();
    
}