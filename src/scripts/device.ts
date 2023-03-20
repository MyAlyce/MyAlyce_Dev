
import { initDevice, Devices, FilterSettings } from 'device-decoder'
import { state } from 'graphscript';

let device;

export function disconnectDevice() {
    device?.disconnect();
    state.setState({device:undefined});
}

export async function connectDevice() {
    const device = await initDevice(
        Devices['BLE']['nrf5x'],
        {
            ondecoded: { //after data comes back from codec
                '0002cafe-b0ba-8bad-f00d-deadbeef0000': (data: {
                    [key: string]: number[]
                }) => {
                    state.setValue('emg', data); //these values are now subscribable 
                }, //ads131m08 (main)
                '0003cafe-b0ba-8bad-f00d-deadbeef0000': (data: {
                    red: number[],
                    ir: number[],
                    max_dietemp: number,
                    timestamp: number
                }) => {
                    state.setValue('ppg', data);
                }, //max30102
                '0004cafe-b0ba-8bad-f00d-deadbeef0000': (data: {
                    ax: number[],
                    ay: number[],
                    az: number[],
                    gx: number[],
                    gy: number[],
                    gz: number[],
                    mpu_dietemp: number,
                    timestamp: number
                }) => {
                    state.setValue('imu', data);
                }, //mpu6050
                '0005cafe-b0ba-8bad-f00d-deadbeef0000': (data: {
                    [key: string]: number[]
                }) => {
                    //state.emg2 = data;
                    state.setValue('emg2', data);
                }, //extra ads131 (if plugged in)
                '0006cafe-b0ba-8bad-f00d-deadbeef0000': (data: {
                    temp: number[],
                    pressure: number[],
                    humidity: number[], //if using BME, not available on BMP
                    altitude: number[]
                }) => {
                    state.setValue('env', data);
                } //bme280
            },
            onconnect: () => {
                this.setState({deviceConnected:true});
            },
            ondisconnect: () => {
                this.setState({deviceConnected:false});
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