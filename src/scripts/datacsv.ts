import { workers } from "device-decoder";
import { client, state, webrtc } from "./client";

import gsworker from './device.worker'
import { RTCCallInfo } from "./webrtc";
import { WorkerInfo } from "graphscript";
import { parseCSVData } from "graphscript-services.storage";

state.setState({
    isRecording:false,
    recordingPPG:false,
    recordingEMG:false,
    recordingIMU:false,
    recordingENV:false
});

let recordingSubs = {} as any;

let fileNames = {} as any;


export const recordingsList = {
    ppg:'./recordings/JoshuaBrewster_PPG_2023-05-16T03_00_47.662Z.csv',
    hr:'./recordings/JoshuaBrewster_HRV_2023-05-16T03_00_47.662Z.csv',
    breath:'./recordings/JoshuaBrewster_BREATH_2023-05-16T03_00_47.662Z.csv',
    ecg:'./recordings/JoshuaBrewster_ECG_2023-05-16T03_09_02.553Z.csv',
    emg:'./recordings/JoshuaBrewster_EMG_2023-05-16T03_09_02.553Z.csv',
    env:'./recordings/JoshuaBrewster_ENV_2023-05-16T03_00_47.662Z.csv',
    imu:'./recordings/JoshuaBrewster_IMU_2023-05-16T03_00_47.662Z.csv'
};

export const sessionsList = [
    './recordings/JoshuaBrewster_HRV_Session_Joshua_Brewster.csv'
];

export async function readTextFile(file) { //https://stackoverflow.com/questions/39662388/javascript-filereader-onload-get-file-from-server
    const response = await fetch(file);
    
    if(response.status === 200 || response.status === 0)
        return await response.text();

    else return undefined;
}


export const demos = {} as any; //we can cancel these at any time

//roll over data from the parsed csv




export function demoFile(sensor:'emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg', sps?, tcheck?, duration = Infinity) {
    let filename = recordingsList[sensor];

    //make some assumptions
    if(!sps) {
        if(sensor === 'emg') sps = 250;
        else if(sensor === 'ecg') sps = 250;
        else if(sensor === 'ppg') sps = 50;
        else if (sensor === 'imu') sps = 100;
        else if (sensor === 'env') sps = 3;
        else if(sensor === 'hr') sps = 1;
        else if(sensor === 'breath') sps = 0.166667;
    }

    if(!tcheck) {
        if(sensor === 'emg') tcheck = 1000*9/250;
        else if(sensor === 'ecg') tcheck = 1000*9/250;
        else if(sensor === 'ppg') tcheck = 333;
        else if (sensor === 'imu') tcheck = 333;
        else if (sensor === 'env') tcheck = 1000;
        else if(sensor === 'hr') tcheck = 1000;
        else if(sensor === 'breath') tcheck = 1000/0.166667;
    }

    readTextFile(filename).then((contents) => {
        let parsed = parseCSVData(contents, filename, undefined);

        let ctrs = {};

        function genDataFromCSV(sps=250, tduration = 1000, key?:'0') {
            const maxSamples = Math.floor(sps * (tduration / 1000));
            let res = {}

            function doKey(key) {
                res[key] = [] as any; //raw
                if(!ctrs[key]) ctrs[key] = 0;
                //console.log((parsed[key]));
                new Array(maxSamples).fill(0).map((v, i) => {
                    res[key].push(
                        parseFloat(parsed[key][ctrs[key]+i])
                    );
                });
                ctrs[key] += maxSamples;
                if(ctrs[key] + maxSamples > parsed[key].length) ctrs[key] = 0; //roll over
            }

            if(key) {
                doKey(key);
                doKey('timestamp');
            } else {
                for(const key in parsed) {
                    if(key !== 'header' && key !== 'filename' && key !== 'localized') doKey(key);
                }
            }
            
            return res;
        }

        let demo = { running:true }; 

        const simuloopCSV = ( 
            sps = 250, //sample rate
            tcheck = 1000 * 9 / 250, // 250/9 checks per second
            duration = 5000
        ) => {

            let tstart = Date.now();
            let start = tstart;
            const recursiveAwait = async () => {
                if(demo.running) {
                    let output = genDataFromCSV(
                        sps,
                        tcheck,
                        //key
                    );
                    const data = output;

                    //console.log('data', data);
                    let s = sensor;
                    if(s === 'ecg') s = 'emg';
                    state.setState({ [s]:data });

                    //const result = eventDetector(data);
                    //console.log("check result:", result);
                    tstart += tcheck;
                    if (tstart <= start + duration) {
                        await new Promise(res => setTimeout(res, tcheck));
                        recursiveAwait();
                    }
                }
            };
            recursiveAwait();
        };

        simuloopCSV(sps,tcheck,duration);

        demos[sensor] = demo;

    }); 
}



export function demo(sensors = ['emg','ppg','breath','hr','imu','env','ecg']) {
    if(!sensors) sensors = ['emg','ppg','breath','hr','imu','env','ecg'];
        
    let detected = {} as any;
    for(const v of sensors) {
        demoFile(v as any);
        detected['detected'+v.toUpperCase()] = true;
    }

    state.setState({deviceConnected:true, demoing:true, ...detected});
        
}

export function stopdemos() {
    let detected = {} as any;
    for(const key in demos) {
        demos[key].running = false;
        detected['detected'+key.toUpperCase()] = false;
    }
    state.setState({deviceConnected:false, demoing:false, ...detected});
}





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
            csvworkers[streamId ? streamId+'ppg' : 'ppg'].post('appendCSV',[ppg, fileNames['ppg']]);
        });
    }

    if(!sensors || sensors.includes('breath')) {
        let makeCSV = () => {
            let filename =  dir+`/BRE_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['breath'] = filename;
            
            if(state.data.isRecording) csvworkers[streamId ? streamId+'breath' : 'breath']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'breath' : 'breath'].post('appendCSV',[breath, fileNames['breath']]);
        });
    }

    if(!sensors || sensors.includes('hr')) {
        let makeCSV = () => {
            let filename =  dir+`/HRV_${new Date().toISOString()}${subTitle ? subTitle : streamId ? '_'+streamId : ''}.csv`;
            fileNames['hr'] = filename;
            if(state.data.isRecording) csvworkers[streamId ? streamId+'hr' : 'hr']?.run('createCSV', [
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
            csvworkers[streamId ? streamId+'hr' : 'hr'].post('appendCSV',[hr, fileNames['hr']]);
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
            csvworkers[streamId ? streamId+'emg' : 'emg'].post('appendCSV',[data, fileNames['emg']]);
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
            csvworkers[streamId ? streamId+'ecg' : 'ecg'].post('appendCSV',[data, fileNames['ecg']]);
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
            csvworkers[streamId ? streamId+'imu' : 'imu'].post('appendCSV',[imu,fileNames['imu']]);
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
            csvworkers[streamId ? streamId+'env' : 'env'].post('appendCSV', [env,fileNames['env']]);
        });
    }
}

export async function stopRecording(streamId?:string, dir='data') {
    state.setState({isRecording:false});

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
    await tempworker.run('checkFolderList',[dir+'/folderList',name]);

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





