import { Alert } from "./Alert";


export class HeartRateAlert extends Alert {

    constructor(
        onEvent:(event: {message:string, value:number, timestamp:number}) => void,
        subscribeTo:string, //the state key we want
        name='heartAlert', 
        sampleRate?:number
    ) {
        super(
            name,
            subscribeTo='hr',
            onEvent,
            function check(
                data:{
                    hr: number,
                    hrv: number, //higher is better
                    timestamp:  number[]|number
                }
            ) {
                if(this.failed === undefined) this.failed = 0;
                if(data.hr < 25) {
                    this.failed++;
                    if(this.failed >= 5) {
                        let ts = data.timestamp;
                        if(Array.isArray(ts)) ts = ts[ts.length-1];
                        this.failed = 0
                        return {message:"Heart rate low", value:data.hr, timestamp:ts ? ts : Date.now()};
                        
                    }
                }
                else if (data.hr > 180) {
                    this.failed++;
                    if(this.failed >= 5) {
                        let ts = data.timestamp;
                        if(Array.isArray(ts)) ts = ts[ts.length-1];
                        this.failed = 0;
                        return {message:"Heart rate high", value:data.hr, timestamp:ts ? ts : Date.now()};
                        
                    }
                } else this.failed = 0;
            },
            {
                sps:sampleRate //e.g. write the sample rate
            }
        );
    }

}