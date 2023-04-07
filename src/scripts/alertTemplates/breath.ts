import { Alert } from "./Alert";


export class BreathAlert extends Alert {

    constructor(
        onEvent:(event: {message:string,bpm:number, timestamp:number}) => void,
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
                    bpm: number,
                    change: number, //higher is better
                    height0: number,
                    height1: number,
                    timestamp: number
                }
            ) {
                if(data.bpm < 3) return {message:"Breathing rate low", bpm:data.bpm, timestamp:data.timestamp};
                else if (data.bpm > 20) return {message:"Breathing rate high", bpm:data.bpm, timestamp:data.timestamp};
            },
            {
                sps:sampleRate //e.g. write the sample rate
            }
        );
    }

}