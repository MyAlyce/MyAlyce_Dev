export class DataStreamAlgorithm {
    bufferLength: number;
    buffer: number[];
    
    constructor(bufferLength: number) {
        this.bufferLength = bufferLength;
        this.buffer = [];
    }

    step = (data: { channel: number[] }): { result: boolean, index?: number } => { //input and output any SERIALIZABLE data structures
        // buffer the data
        this.buffer.push(...data.channel);
        if (this.buffer.length > this.bufferLength) {
            this.buffer.splice(0, this.buffer.length - this.bufferLength);
        }

        const index = data.channel.findIndex(val => val > 0.9); // find index of value greater than 0.9
        if (index !== -1) {
            return { result: true, index };
        } else {
            return { result: false };
        }
    }
}

// test data generator
function genData(
    sps = 250, 
    tduration = 1000, 
    fn = (v: number, i: number, time: number) => Math.random(), 
    tstart = Date.now()
    ): number[] {
    const maxSamples = Math.floor(sps * (tduration / 1000));
    return new Array(maxSamples).fill(0).map((v, i) => {
        const time = tstart + 1000 * i / sps;
        return fn(v, i, time);
    });
}

const algorithm = new DataStreamAlgorithm(1000);

//simulate data and run the event detector
const simuloop = (
    eventDetector: (data: { channel: number[] }) => { result: boolean, index?: number, [key:string]:any },
    sps = 250,
    tcheck = 1000 / 9, // 9 checks per second
    duration = 3000,
    dataGen: ((v: number, i: number, time: number) => number) = (v, i, time) => Math.random()
) => {
    let tstart = Date.now();
    const recursiveAwait = async () => {
        const data = { 
            channel: genData(sps, tcheck, dataGen, tstart) 
        };
        console.log('data', data);
        const result = eventDetector(data);
        console.log("check result:", result.result);
        tstart += tcheck;
        if (tstart <= Date.now() + duration) {
            await new Promise(res => setTimeout(res, tcheck));
            recursiveAwait();
        }
    };
    recursiveAwait();
};

simuloop(algorithm.step);
