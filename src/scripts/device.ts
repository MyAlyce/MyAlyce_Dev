
import { initDevice, Devices, FilterSettings, workers, BLEDeviceStream } from 'device-decoder'

import gsworker from './device.worker'

import { Sensors, state } from './client'//'../../../graphscript/index'//
import { ByteParser } from 'device-decoder/src/util/ByteParser';
import { setupAlerts } from './alerts';
import { graph } from './client';
import { WorkerInfo } from 'graphscript';

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

export let serviceCharacteristic = '0000cafe-b0ba-8bad-f00d-deadbeef0000';

export let characteristicCallbacks = {
    emg:{characteristic:'0002cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //ads131m08 (main)
        [key: string]: number[]
    }) => {
        if(!state.data.detectedEMG) state.setState({detectedEMG:true});
        state.setValue('emg', data); //these values are now subscribable 
        state.setValue('ecg', data[5]);
    }},
    ppg:{characteristic:'0003cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //max30102
        red: number[],
        ir: number[],
        max_dietemp: number,
        timestamp: number
    }) => {
        if(!state.data.detectedPPG) state.setState({detectedPPG:true});
        state.setValue('ppg', data);
        
        let d = Object.assign({}, data);
        d.timestamp = genTimestamps(32, 100, data.timestamp) as any;
        
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
        state.setValue('imu', data);
    }},
    env:{characteristic:'0002cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //bme280
        temp: number[],
        pressure: number[],
        humidity: number[], //if using BME, not available on BMP
        altitude: number[]
    }) => {
        if(!state.data.detectedENV) state.setState({detectedENV:true});
        //console.log(data);
        state.setValue('env', data);
    }},
    emg2:{characteristic:'0005cafe-b0ba-8bad-f00d-deadbeef0000', callback:(data: { //extra ads131 (if plugged in)
        [key: string]: number[]
    }) => {
        if(!state.data.detectedEMG2) state.setState({detectedEMG2:true});
        state.setValue('emg2', data);
    }}
}

export async function setupHRWorker() {
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

    const ads131m08FilterSettings: { [key: string]: FilterSettings } = {
        '0': JSON.parse(JSON.stringify(emgsetting)),
        '1': JSON.parse(JSON.stringify(emgsetting)),
        '2': JSON.parse(JSON.stringify(emgsetting)),
        '3': JSON.parse(JSON.stringify(emgsetting)),
        '4': JSON.parse(JSON.stringify(emgsetting)),
        '5': JSON.parse(JSON.stringify(emgsetting)),
        '6': JSON.parse(JSON.stringify(emgsetting)),
        '7': JSON.parse(JSON.stringify(emgsetting)),
        'red': JSON.parse(JSON.stringify(ppgsetting)),
        'ir': JSON.parse(JSON.stringify(ppgsetting))
    }

    device.workers.streamworker.run('setFilters', ads131m08FilterSettings); //filter the EMG results

    
    state.setState({device});
}