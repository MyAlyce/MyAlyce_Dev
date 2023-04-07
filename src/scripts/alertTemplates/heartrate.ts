import { Alert } from "./Alert";


export class HeartRateAlert extends Alert {

    constructor(
        onEvent:(event: {message:string,bpm:number, timestamp:number}) => void,
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
                    bpm: number,
                    change: number, //higher is better
                    height0: number,
                    height1: number,
                    timestamp: number
                }
            ) {
                if(data.bpm < 25) return {message:"Heart rate low", bpm:data.bpm, timestamp:data.timestamp};
                else if (data.bpm > 180) return {message:"Heart rate high", bpm:data.bpm, timestamp:data.timestamp};
            },
            {
                sps:sampleRate //e.g. write the sample rate
            }
        );
    }

}