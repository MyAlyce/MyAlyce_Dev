
import { initDevice, Devices, FilterSettings, workers } from 'device-decoder'

import gsworker from './device.worker'

import { state } from './client'//'../../../graphscript/index'//
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

export async function connectDevice(mode:'emg'|'other'|'all'='other') {

    const hrworker = workers.addWorker({url:gsworker});
    const brworker = workers.addWorker({url:gsworker});

    let t1 = await hrworker.run('loadFromTemplate',['beat_detect','hr',{
        maxFreq:3,
        sps:100
    }]);
    
    let t2 = await brworker.run('loadFromTemplate',['beat_detect','breath',{
        maxFreq:0.2,
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

    (Devices['BLE']['nrf5x'] as any).namePrefix = "B";


    let ondecoded = {}  as any;
    if(mode === 'emg' || mode === 'all') {
        ondecoded['0002cafe-b0ba-8bad-f00d-deadbeef0000'] =  (data: { //ads131m08 (main)
            [key: string]: number[]
        }) => {
            if(!state.data.detectedEMG) state.setState({detectedEMG:true});
            state.setValue('emg', data); //these values are now subscribable 
        }
        
        ondecoded['0005cafe-b0ba-8bad-f00d-deadbeef0000'] = (data: { //extra ads131 (if plugged in)
            [key: string]: number[]
        }) => {
            if(!state.data.detectedEMG2) state.setState({detectedEMG2:true});
            state.setValue('emg2', data);
        }
    }
    if(mode === 'other' || mode === 'all') {
        ondecoded['0003cafe-b0ba-8bad-f00d-deadbeef0000'] = (data: { //max30102
            red: number[],
            ir: number[],
            max_dietemp: number,
            timestamp: number
        }) => {
            if(!state.data.detectedPPG) state.setState({detectedPPG:true});
            state.setValue('ppg', data);
            
            let d = Object.assign({}, data);
            d.timestamp = genTimestamps(32, 100, data.timestamp) as any;
            hrworker.post('hr', d);
            brworker.post('breath', d);

        }
        ondecoded['0004cafe-b0ba-8bad-f00d-deadbeef0000'] = (data: { //mpu6050
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
        }
        ondecoded['0006cafe-b0ba-8bad-f00d-deadbeef0000'] = (data: { //bme280
            temp: number[],
            pressure: number[],
            humidity: number[], //if using BME, not available on BMP
            altitude: number[]
        }) => {
            if(!state.data.detectedENV) state.setState({detectedENV:true});
            //console.log(data);
            state.setValue('env', data);
        }

    }


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
            }
        }
    );
    
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