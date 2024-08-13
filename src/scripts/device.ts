
import { initDevice, Devices, FilterSettings, workers, BLEDeviceStream } from 'device-decoder'

import gsworker from './device.worker'

import { Sensors, state } from './client'//'../../../graphscript/index'//
import { ByteParser } from 'device-decoder/src/util/ByteParser';
import { setupAlerts } from './alerts';
import { graph } from './client';
import { WorkerInfo } from 'graphscript-workers';
import { Math2 } from 'brainsatplay-math';

export let device:BLEDeviceStream;

function genTimestamps(ct, sps, from?) {
    let now = from ? from : Date.now();
    let toInterp = [now - ct * 1000 / sps, now];
    return ByteParser.upsample(toInterp, ct);
}

export function disconnectDevice() {
    device?.disconnect();
    state.setState({device:undefined});
}

export let hrworker: WorkerInfo; 
export let brworker: WorkerInfo;

//for reference
export let sps = {
    ppg:100,
    imu:100,
    compass:100,
    emg:250,
    ecg:250, //part of the EMG chip
    env:3
}

export let tCorrections = {
    imu:0,
    compass:0,
    ppg:0,
    emg:0,
}

export let serviceCharacteristic = '0000cafe-b0ba-8bad-f00d-deadbeef0000';


//todo: check data isn't out of range for running the algos, and report moving averages for heartrate
export let characteristicCallbacks = {
    emg:{characteristic:'0002cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //ads131m08 (main)
        timestamp:number,
        [key: string]: number|number[]
    }) => {
        if(!state.data.detectedEMG) state.setState({detectedEMG:true});
        //interpolate timestamps inferred from time-of-arrival timestamp provided by the driver
        data.timestamp = genTimestamps((data[0] as number[]).length, sps.emg, data.timestamp - 1000*((data[0] as number[]).length)/sps.emg) as any;
        state.setValue('emg', data); //these values are now subscribable 
        state.setValue('ecg', {5:data[5], timestamp:data.timestamp});
    }},
    ppg:{characteristic:'0003cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //max30102
        red: number[],
        ir: number[],
        max_dietemp: number,
        timestamp: number
    }) => {
        if(!state.data.detectedPPG) state.setState({detectedPPG:true});
        data.timestamp = genTimestamps(data.red.length, sps.ppg, data.timestamp - 1000*(data.red.length)/sps.ppg) as any;
        state.setValue('ppg', data);
        
        let d = Object.assign({}, data);
        
        hrworker?.post('hr', d);
        brworker?.post('breath', d);

    }},
    imu:{characteristic:'0004cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //mpu6050
        ax: number[],
        ay: number[],
        az: number[],
        gx: number[],
        gy: number[],
        gz: number[],
        mpu_dietemp: number,
        timestamp: number
    }) => {
        if(!state.data.detectedIMU) state.setState({detectedIMU:true});
        data.timestamp = genTimestamps((data.ax as number[]).length, sps.imu, data.timestamp - 1000*((data.ax as number[]).length)/sps.imu) as any;
        state.setValue('imu', data);
    }},
    env:{characteristic:'0002cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //bme280
        temp: number[],
        pressure: number[],
        humidity: number[], //if using BME, not available on BMP
        altitude: number[],
        timestamp: number
    }) => {
        if(!state.data.detectedENV) state.setState({detectedENV:true});
        data.timestamp = genTimestamps(data.temp.length, sps.env, data.timestamp - 1000*(data.temp.length/sps.env)) as any;
        state.setValue('env', data);
    }},
    emg2:{characteristic:'0005cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //extra ads131 (if plugged in)
        timestamp:number,
        [key: string]: number|number[]
    }) => {
        if(!state.data.detectedEMG2) state.setState({detectedEMG2:true});
        data.timestamp = genTimestamps((data[0] as number[]).length, sps.emg, data.timestamp - 1000*((data[0] as number[]).length)/sps.emg) as any;
        state.setValue('emg2', data);
    }}
}

export async function setupHRWorker() {

    //@ts-ignore
    hrworker = workers.addWorker({url:gsworker});

    let t1 = await hrworker.run('loadFromTemplate',['beat_detect','hr',{
        maxFreq:3,
        sps:100
    }]);
    
    hrworker.subscribe('hr', (data: (undefined|{
        bpm: number,
        change: number, //higher is better
        height0: number,
        height1: number,
        timestamp: number
    })[]) => {

        data.map((v) => {
            if(v) {
                
                const hr = {
                    hr: v.bpm,
                    hrv: v.change,
                    timestamp: v.timestamp
                };
        
                state.setValue('hr', hr);
            }
        });
        
    });
}

export function terminateHRWorker() {
    hrworker?.terminate();
    hrworker = undefined as any;
}

export async function setupBRWorker() {
    //@ts-ignore
    brworker = workers.addWorker({url:gsworker});
    let t2 = await brworker.run('loadFromTemplate',['beat_detect','breath',{
        maxFreq:0.2,
        sps:100
    }]);

    brworker.subscribe('breath', (data: (undefined|{
        bpm: number,
        change: number, //lower is better
        height0: number,
        height1: number,
        timestamp: number
    })[]) => {

        data.map((v) => {
            if(v) {

                const breath = {
                    breath: v.bpm,
                    brv: v.change,
                    timestamp: v.timestamp
                };
        
                state.setValue('breath', breath);
            }
        });

    });
}

//do this when the input is detected to be out of range
export async function resetAlgorithms() {
    hrworker?.run('remove',['hr',false]);
    brworker?.run('remove',['breath',false]);

    await brworker.run('loadFromTemplate',['beat_detect','breath',{
        maxFreq:0.2,
        sps:100
    }]);
    await hrworker.run('loadFromTemplate',['beat_detect','hr',{
        maxFreq:3,
        sps:100
    }]);
}

export function terminateBRWorker() {
    brworker?.terminate();
    brworker = undefined as any;
}

export async function connectDevice(sensors?:Sensors[]) {

    if(!sensors) sensors = ['ppg','hr','breath','imu','emg','ecg','env'];

    if(sensors.includes('hr')) {
        await setupHRWorker();
    }
    if(sensors.includes('breath')) {
        await setupBRWorker();
    }
    
    let ondecoded = {}  as any;

    for(const key of sensors) {
        if(characteristicCallbacks[key]) {
            ondecoded[characteristicCallbacks[key].characteristic] = characteristicCallbacks[key].callback;
        }
    }
    //if(sensors.includes('emg2')) {}


    (Devices['BLE']['nrf5x'] as any).namePrefix = "B";

    let alertNodes; 

    device = await initDevice(
        Devices['BLE']['nrf5x'],
        {
            workerUrl:gsworker,
            ondecoded:ondecoded,
            onconnect: () => {
                state.setState({deviceConnected:true});
                //Setup Alerts
                alertNodes = setupAlerts();
            },
            ondisconnect: () => {
                state.setState({deviceConnected:false});
                if(alertNodes) for(const key in alertNodes) {
                    graph.remove(alertNodes[key]);
                }
                hrworker?.terminate();
                brworker?.terminate();
                hrworker = undefined as any;
                brworker = undefined as any;
            }
        }
    ) as BLEDeviceStream;
    
    const sps = 250;
    const gain = 32;
    const nbits = 24;
    const vref = 1.2;

    let emgsetting = {
        sps,
        useDCBlock: false,
        useBandpass: false,
        useLowpass: true,
        lowpassHz: 45,
        // bandpassLower:3, 
        // bandpassUpper:45, 
        useScaling: true,
        scalar: 0.96 * 1000 * vref / (gain * (Math.pow(2, nbits) - 1)), //adjust to millivolts
        //trimOutliers:true,
        //outlierTolerance:0.3
    } as FilterSettings;

    
    let ppgsetting = {
        sps:100,
        useDCBlock: false,
        useBandpass: false,
        useLowpass: true,
        lowpassHz: 16,
        // bandpassLower:3, 
        // bandpassUpper:45, 
        // useScaling: true,
        // scalar: 0.96 * 1000 * vref / (gain * (Math.pow(2, nbits) - 1)), //adjust to millivolts
        //trimOutliers:true,
        //outlierTolerance:0.3
    } as FilterSettings;

    const FilterSettings: { [key: string]: FilterSettings } = {
        '0': JSON.parse(JSON.stringify(emgsetting)),
        '1': JSON.parse(JSON.stringify(emgsetting)),
        '2': JSON.parse(JSON.stringify(emgsetting)),
        '3': JSON.parse(JSON.stringify(emgsetting)),
        '4': JSON.parse(JSON.stringify(emgsetting)),
        '5': JSON.parse(JSON.stringify(emgsetting)),
        '6': JSON.parse(JSON.stringify(emgsetting)),
        '7': JSON.parse(JSON.stringify(emgsetting)),
        'red': JSON.parse(JSON.stringify(ppgsetting)),
        'infrared': JSON.parse(JSON.stringify(ppgsetting))
    }

    device.workers.streamworker.run('setFilters', FilterSettings); //filter the EMG results

    state.setState({device});
}


//we are going to perform a cross correlation to sync e.g. PPG/EMG and IMU data.
export async function syncTimestamps(sensors:('emg'|'imu'|'ppg'|'ecg')[], nSec=3, referenceSensor='imu') {
    let buffers = {} as any;  
    let tStart;  
    let duration = nSec * 1000;
    let subscribed = {} as any;
    let allUnsubscribed = false;
    

    let getAdjustedSamples = (s:Sensors) => {
        if(s === 'imu') {
            let summed = Math2.vecadd(buffers.imu.ax,buffers.imu.ay,buffers.imu.az);
            let mean = Math2.mean(summed);
            let adjusted = Math2.vecsubScalar(summed, mean); //adjust for mean because we are running a cross-correlation to match frequencies only
            
            return {
                data:adjusted,
                timestamp:buffers.imu.timestamp,
            };
        } else if (s === 'ppg') {
            let summed = Math2.vecadd(buffers.ppg.red,buffers.ppg.infrared);
            let mean = Math2.mean(summed);
            let adjusted = Math2.vecsubScalar(summed, mean);

            return {
                data: adjusted,
                timestamp:buffers.ppg.timestamp
            };
        } else if (s === 'emg') {
            let mean = Math2.mean(buffers.emg[0]);
            let adjusted = Math2.vecsubScalar(buffers.emg[0], mean);

            return {
                data: adjusted,
                timestamp:buffers.ppg.timestamp
            };
        } else if (s === 'ecg') {
            let mean = Math2.mean(buffers.emg[5]);
            let adjusted = Math2.vecsubScalar(buffers.emg[5], mean);

            return {
                data: adjusted,
                timestamp:buffers.emg.timestamp
            };
        }
    }

    sensors.forEach((s) => {
        buffers[s] = {};
        if(s === referenceSensor) {
            let sub = state.subscribeEvent(s,(data)=>{
                if(!tStart) tStart = data.timestamp[0];
                BufferData(data,s,buffers);
                if(allUnsubscribed && Date.now() >= tStart + duration) {
                    state.unsubscribeEvent(s,sub);
                    
                    let samples = {} as any;
                    let references = {} as any;

                    //interpolate slices to be the same number of samples 

                    sensors.forEach((ss) => {
                        samples[ss] = getAdjustedSamples(ss);
                    });
                    
                    //now run the cross correlation to get a toffset correction
                    sensors.forEach((ss) => {
                        if(ss !== referenceSensor) {
                            references[ss] = {...samples[referenceSensor]};
                            
                            //we're gonna trim the data being correlated to be as close to the same time period as possible (won't be exact overlap)
                            
                            //trim starts
                            if(samples[referenceSensor].timestamp[0] > samples[ss].timestamp[0]) {
                                let offset = 1;
                                while(samples[ss].timestamp[offset] < samples[referenceSensor].timestamp[0] && offset !== samples[ss].timestamp[offset].length) {
                                    offset++;
                                }
                                samples[ss].data = samples[ss].data.slice(offset);
                                samples[ss].timestamp = samples[ss].timestamp.slice(offset);
                            } else if (samples[referenceSensor].timestamp[0] < samples[ss].timestamp[0]) {
                                let offset = 1;
                                while(samples[ss].timestamp[0] > samples[referenceSensor].timestamp[offset] 
                                    && offset !== samples[referenceSensor].timestamp[offset].length
                                ) {
                                    offset++;
                                }
                                references[ss].data = references[ss].data.slice(offset);
                                references[ss].timestamp = references[ss].timestamp.slice(offset);
                            }
    
                            const refend = samples[referenceSensor].timestamp.length-1;
                            const ssend = samples[ss].timestamp.length-1;
                            //trim ends
                            if(samples[referenceSensor].timestamp[refend] < samples[ss].timestamp[ssend]) {
                                let offset = ssend;
                                while(samples[ss].timestamp[offset] > samples[referenceSensor].timestamp[refend] && offset !== -1) {
                                    offset--;
                                }
                                samples[ss].data = samples[ss].data.slice(0,offset);
                                samples[ss].timestamp = samples[ss].timestamp.slice(0,offset);
                            } else if (samples[referenceSensor].timestamp[refend] > samples[ss].timestamp[ssend]) {
                                let offset = refend;
                                while(samples[ss].timestamp[ssend] < samples[referenceSensor].timestamp[offset] && offset !== -1) {
                                    offset--;
                                }
                                references[ss].data = references[ss].data.slice(0,offset);
                                references[ss].timestamp = references[ss].timestamp.slice(0,offset);
                            }

                            //now the data arrays should be relatively overlapping
                            let interpTo = samples[referenceSensor].data.length;
                            if(ss !== referenceSensor) 
                                samples[ss].data = Math2.resample(samples[ss].data, interpTo); 

                            let correlogram = Math2.crosscorrelation(references[ss].data, samples[ss].data);
                            let maxLag = Math2.findCorrelationLags(correlogram, sps[referenceSensor],true);
                            tCorrections[ss] = (maxLag as any).offset*1000 + (samples[ss].timestamp[0]-references[ss].timestamp[0]); 
                            //account for reference frame change, maybe better would be to scale and use padding?
                        }
                    });

                    //now apply the toffset to the correlated sensors
                }
            });
        }
        else {
            let sub = state.subscribeEvent(s,(data)=>{
                if(tStart) { //wait for imu to start
                    BufferData(data,s,buffers);
                    if(Date.now() >= tStart + duration) {
                        state.unsubscribeEvent(s,sub);
                        subscribed[s] = undefined;
                        if(!Object.keys(subscribed).find((v)=>{
                            if(subscribed[v]) return true;
                        })) {
                            allUnsubscribed = true; //makes sure all buffers are within the referenceSensor
                        }
                    }
                        
                }
            });
            subscribed[s] = sub;
        }
        

    })
}


export function BufferData(
    data:any, 
    bufKey:string,  
    buffers:{[key:string]:any[]}={}
) {
    if(!buffers[bufKey]) buffers[bufKey] = {} as any;
    for(const key in data) {
        if(!(key in buffers[bufKey])) {
            if(Array.isArray(data[key]))
                buffers[bufKey][key] = [...data[key]];
            else buffers[bufKey][key] = [data[key]];
        }
        else {
            if(Array.isArray((data[key])))
                buffers[bufKey][key].push(...data[key]);
            else
                buffers[bufKey][key].push(data[key]);
        }
    }

    return buffers;
}
