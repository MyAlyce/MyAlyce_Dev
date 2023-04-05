
import { initDevice, Devices, FilterSettings, workers } from 'device-decoder'

import gsworker from './device.worker'
export {gsworker};

import { state } from 'graphscript'//'../../../graphscript/index'//
import { ByteParser } from 'device-decoder/src/util/ByteParser';
import { setupAlerts } from './alerts';
import { graph } from './client';

let device;

function genTimestamps(ct, sps, from?) {
    let now = from ? from : Date.now();
    let toInterp = [now - ct * 1000 / sps, now];
    return ByteParser.upsample(toInterp, ct);
}

export function disconnectDevice() {
    device?.disconnect();
    state.setState({device:undefined});
}

export async function connectDevice() {

    const hrworker = workers.addWorker({url:gsworker});
    const brworker = workers.addWorker({url:gsworker});

    hrworker.post('loadFromTemplate',['beat_detect','hr',{
        sps:100
    }]);
    brworker.post('loadFromTemplate',['beat_detect','breath',{
        sps:100
    }]);

    hrworker.subscribe('hr', (data: {
        bpm: number,
        change: number, //higher is better
        height0: number,
        height1: number,
        timestamp: number
    }) => {
        const hr = {
            hr: data.bpm,
            hrv: data.change,
            timestamp: data.timestamp
        };

        state.setValue('hr', hr);

    });
    brworker.subscribe('breath', (data: {
        bpm: number,
        change: number, //lower is better
        height0: number,
        height1: number,
        timestamp: number
    }) => {
        const breath = {
            breath: data.bpm,
            brv: data.change,
            timestamp: data.timestamp
        };

        state.setValue('breath', breath);

    });

    //Setup Alerts
    let nodes = setupAlerts();

    device = await initDevice(
        Devices['BLE']['nrf5x'],
        {
            ondecoded: { //after data comes back from codec
                '0002cafe-b0ba-8bad-f00d-deadbeef0000': (data: { //ads131m08 (main)
                    [key: string]: number[]
                }) => {
                    if(!state.data.detectedEMG) state.data.detectedEMG = true;
                    state.setValue('emg', data); //these values are now subscribable 
                }, 
                '0003cafe-b0ba-8bad-f00d-deadbeef0000': (data: { //max30102
                    red: number[],
                    ir: number[],
                    max_dietemp: number,
                    timestamp: number
                }) => {
                    if(!state.data.detectedPPG) state.data.detectedPPG = true;
                    state.setValue('ppg', data);
                    
                    let d = Object.assign({}, data);
                    d.timestamp = genTimestamps(32, 100, data.timestamp) as any;
                    hrworker.post('hr', d);
                    brworker.post('breath', d);

                },
                '0004cafe-b0ba-8bad-f00d-deadbeef0000': (data: { //mpu6050
                    ax: number[],
                    ay: number[],
                    az: number[],
                    gx: number[],
                    gy: number[],
                    gz: number[],
                    mpu_dietemp: number,
                    timestamp: number
                }) => {
                    if(!state.data.detectedIMU) state.data.detectedIMU = true;
                    state.setValue('imu', data);
                },
                '0005cafe-b0ba-8bad-f00d-deadbeef0000': (data: { //extra ads131 (if plugged in)
                    [key: string]: number[]
                }) => {
                    if(!state.data.detectedEMG2) state.data.detectedEMG2 = true;
                    state.setValue('emg2', data);
                },
                '0006cafe-b0ba-8bad-f00d-deadbeef0000': (data: { //bme280
                    temp: number[],
                    pressure: number[],
                    humidity: number[], //if using BME, not available on BMP
                    altitude: number[]
                }) => {
                    if(!state.data.detectedENV) state.data.detectedENV = true;
                    state.setValue('env', data);
                }
            },
            onconnect: () => {
                this.setState({deviceConnected:true});
            },
            ondisconnect: () => {
                this.setState({deviceConnected:false});
                for(const key in nodes) {
                    graph.remove(key,true);
                }
            }
        }
    );

    
    const sps = 250;
    const gain = 32;
    const nbits = 24;
    const vref = 1.2;

    let defaultsetting = {
        sps,
        useDCBlock: false,
        useBandpass: false,
        useLowpass: true,
        lowpassHz: 30,
        // bandpassLower:3, 
        // bandpassUpper:45, 
        useScaling: true,
        scalar: 0.96 * 1000 * vref / (gain * (Math.pow(2, nbits) - 1)), //adjust to millivolts
        //trimOutliers:true,
        //outlierTolerance:0.3
    } as FilterSettings;

    const ads131m08FilterSettings: { [key: string]: FilterSettings } = {
        '0': JSON.parse(JSON.stringify(defaultsetting)),
        '1': JSON.parse(JSON.stringify(defaultsetting)),
        '2': JSON.parse(JSON.stringify(defaultsetting)),
        '3': JSON.parse(JSON.stringify(defaultsetting)),
        '4': JSON.parse(JSON.stringify(defaultsetting)),
        '5': JSON.parse(JSON.stringify(defaultsetting)),
        '6': JSON.parse(JSON.stringify(defaultsetting)),
        '7': JSON.parse(JSON.stringify(defaultsetting))
    }

    device.workers.streamworker.run('setFilters', ads131m08FilterSettings); //filter the EMG results

    
    state.setState({device});
}