import { workers } from "device-decoder";
import { state } from "graphscript";
import gsworker from './device.worker'

export const csvworker = workers.addWorker({url:gsworker});

state.setState({
    isRecording:false,
    recordingPPG:false,
    recordingEMG:false,
    recordingIMU:false,
    recordingENV:false
});

export const csvworkers = {
    emg: workers.default.addWorker({ url: gsworker }),
    ppg: workers.default.addWorker({ url: gsworker }),
    imu: workers.default.addWorker({ url: gsworker }),
    env: workers.default.addWorker({ url: gsworker }),
    emg2: workers.default.addWorker({ url: gsworker })
}

let recordingSubs = {} as any;

export function recordCSV(sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env')[],streamId?:string) {
    state.setState({isRecording:true});

    if(!sensors || sensors.includes('ppg') || sensors.includes('breath') || sensors.includes('hr')) {
        csvworkers.ppg?.run('createCSV', [
            `data/PPG_${new Date().toISOString()}.csv`,
            [
                'timestamp',
                'red', 'ir', 'hr', 'spo2', 'breath', 'max_dietemp'
            ],
            0,
            100
        ]);
    }

    if(!sensors || sensors?.includes('emg')) {
        csvworkers.emg?.run('createCSV', [
            `data/EMG_${new Date().toISOString()}.csv`,
            [
                'timestamp',
                '0', '1' //only record the first two channels for now (so much data!!)
            ],
            5,
            250
        ]);
        recordingSubs[`${streamId ? streamId : ''}emg`] = this.subscriptions.emg = state.subscribeEvent(streamId ? streamId+'emg' : 'emg', (data) => {
            csvworkers.emg.run('appendCSV',data);
        })
    }
    if(!sensors || sensors?.includes('ppg')) {
        recordingSubs[`${streamId ? streamId : ''}ppg`] = this.subscriptions.ppg = state.subscribeEvent(streamId ? streamId+'ppg' :'ppg', (ppg) => {
            csvworkers.ppg.run('appendCSV',ppg);
        })
    }
    if(!sensors || sensors?.includes('hr')) {
        recordingSubs[`${streamId ? streamId : ''}hr`] = this.subscriptions.hr = state.subscribeEvent(streamId ? streamId+'hr' :'hr', (hr) => {
            csvworkers.ppg.run('appendCSV',hr);
        })
    }
    if(!sensors || sensors?.includes('imu')) {
        csvworkers.imu?.run('createCSV', [
            `data/IMU_${new Date().toISOString()}.csv`,
            [
                'timestamp',
                'ax', 'ay', 'az', 'gx', 'gy', 'gz', 'mpu_dietemp'
            ],
            0,
            100
        ]);
        recordingSubs[`${streamId ? streamId : ''}imu`] = this.subscriptions.imu = state.subscribeEvent(streamId ? streamId+'imu' :'imu', (imu) => {
            csvworkers.imu.run('appendCSV',imu);
        })
    }
    if(!sensors || sensors?.includes('breath')) {
        recordingSubs[`${streamId ? streamId : ''}breath`] = this.subscriptions.breath = state.subscribeEvent(streamId ? streamId+'breath' :'breath', (breath) => {
            csvworkers.ppg.run('appendCSV',breath);
        })
    }
    if(!sensors || sensors?.includes('env')) {
        csvworkers.env?.run('createCSV', [
            `data/ENV_${new Date().toISOString()}.csv`,
            [
                'timestamp',
                'temperature', 'pressure', 'humidity', 'altitude'
            ],
            4
        ]);
        recordingSubs[`${streamId ? streamId : ''}env`] = this.subscriptions.env = state.subscribeEvent(streamId ? streamId+'env' :'env', (env) => {
            csvworkers.env.run('appendCSV',env);
        })
    }
}

export function stopRecording(streamId?:string) {
    state.setState({isRecording:false});
    
    if(`${streamId}emg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId}emg`, recordingSubs[`${streamId}emg`]);
    }
    if(`${streamId}ppg` in recordingSubs) {
        state.unsubscribeEvent(`${streamId}ppg`, recordingSubs[`${streamId}ppg`]);
    }
    if(`${streamId}imu` in recordingSubs) {
        state.unsubscribeEvent(`${streamId}imu`, recordingSubs[`${streamId}imu`]);
    }
    if(`${streamId}hr` in recordingSubs) {
        state.unsubscribeEvent(`${streamId}hr`, recordingSubs[`${streamId}hr`]);
    }
    if(`${streamId}breath` in recordingSubs) {
        state.unsubscribeEvent(`${streamId}breath`, recordingSubs[`${streamId}breath`]);
    }
    if(`${streamId}env` in recordingSubs) {
        state.unsubscribeEvent(`${streamId}env`, recordingSubs[`${streamId}env`]);
    }
}