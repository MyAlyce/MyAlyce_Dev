import { Alert } from "./Alert";


export class BreathAlert extends Alert {

    constructor(
        onEvent:(event: {message:string, value:number, timestamp:number}) => void,
        subscribeTo:string, //the state key we want
        name='breathAlert', 
        sampleRate?:number
    ) {
        super(
            name,
            subscribeTo='breath',
            onEvent,
            function check(
                data:{
                    breath: number,
                    brv: number, //higher is better
                    timestamp: number[]|number
                }
            ) {
                if(this.failed === undefined) this.failed = 0;
                if(data.breath < 2.5) {
                    this.failed++;
                    if(this.failed >= 3) {
                        let ts = data.timestamp;
                        if(Array.isArray(ts)) ts = ts[ts.length-1];
                        this.failed = 0;
                        return {message:"Breathing rate low", value:data.breath, timestamp:ts ? ts : Date.now()};
                    }
                }
                else if (data.breath > 20) {
                    this.failed++;
                    if(this.failed >= 3) {
                        let ts = data.timestamp;
                        if(Array.isArray(ts)) ts = ts[ts.length-1];
                        this.failed = 0;
                        return {message:"Breathing rate high", value:data.breath, timestamp:ts ? ts : Date.now()};
                    }
                } else this.failed = 0;
            },
            {
                sps:sampleRate //e.g. write the sample rate
            }
        );
    }

}