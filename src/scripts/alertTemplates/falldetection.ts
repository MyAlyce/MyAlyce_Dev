import { Alert } from "./Alert";


export class FallAlert extends Alert {

    upperBound=50000;

    constructor(
        onEvent:(event: {
            message:string
            value:number,
            timestamp:number
        }) => void,
        subscribeTo:string, //the state key we want
        name='fallAlert', 
        upperBound=50000
    ) {
        super(
            name,
            subscribeTo='imu',
            onEvent,
            function check(
                data: { //mpu6050
                    ax: number[],
                    ay: number[],
                    az: number[],
                    gx: number[],
                    gy: number[],
                    gz: number[],
                    mpu_dietemp: number,
                    timestamp: number
                }
            ) {
                let a = Math.max(...data.ax);
                let b = Math.max(...data.ay);
                let c = Math.max(...data.az);

                let magnitude = Math.sqrt(a*a + b*b + c*c);
                
                if(magnitude > this.upperBound) return {
                    message:"Force Threshold Surpassed: "+this.upperBound,
                    value:magnitude,
                    timestamp:data.timestamp
                }
            },
            {
                upperBound
            }
        );
    }

}