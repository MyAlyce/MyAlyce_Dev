export class DataStreamAlgorithm {
    bufferLength;
    buffer;
    timestampBuffer;
    channel;
    
    constructor(
        bufferLength=1000, 
        channel='0'
    ) {
        this.bufferLength = bufferLength;
        this.buffer = [];
        this.timestampBuffer = [];
        this.channel=channel;
    }

    step = (data) => {
        // buffer the data
        this.buffer.push(...data[this.channel]);
        this.timestampBuffer.push(...data.timestamp);
        if (this.buffer.length > this.bufferLength) {
            this.buffer.splice(0, this.buffer.length - this.bufferLength);
            this.timestampBuffer.splice(0, this.timestampBuffer.length - this.bufferLength);
        }

        //or whatever
        const index = this.buffer.findIndex(val => val > 0.95); // find index of value greater than 0.9
        if (index !== -1) {
            return { 
                result: true, 
                value:this.buffer[index], 
                timestamp:this.timestampBuffer[index] 
            };
        } else {
            return { result: false };
        }
    }
}



import {CSV, parseCSVData} from 'graphscript-services.storage'

let parsed;

//roll over data from the parsed csv
function genDataFromCSV(sps=250, tduration = 1000, key='0') {
    const maxSamples = Math.floor(sps * (tduration / 1000));
    let res = {
        [key]:[] as any, //raw
        timestamp:[] as any //unix time
    };
    new Array(maxSamples).fill(0).map((v, i) => {
        res[key].push(parseFloat(parsed[key][ctr+i]));
        res.timestamp.push(parseFloat(parsed.timestamp?.[ctr+i]))
    });
    ctr += maxSamples;
    if(ctr + maxSamples > parsed[key].length) ctr = 0; //roll over
    return res;
}


const algorithm = new DataStreamAlgorithm(1000);

const simuloopCSV = (

    eventDetector=algorithm.step, //step function, has its own scope for keeping buffers etc
    key='0', //roll over a single channel for this 
    sps = 250, //sample rate
    tcheck = 1000 / 9, // 9 checks per second
    duration = 5000

) => {

    let tstart = Date.now();
    let start = tstart;
    const recursiveAwait = async () => {
        let output = genDataFromCSV(
            sps,
            tcheck,
            key
          );
        const data = output;
        console.log('data', data);
        const result = eventDetector(data);
        console.log("check result:", result);
        tstart += tcheck;
        if (tstart <= start + duration) {
            await new Promise(res => setTimeout(res, tcheck));
            recursiveAwait();
        }
    };
    recursiveAwait();

};



let ctr = 0;

function openCSV() {
    let data = CSV.openCSVRaw().then((res={data:[], filename:''}) => {
        
        console.log(
            res.filename, 
            res.data
        );

        parsed = parseCSVData(
            res.data,
            res.filename,
            undefined
        );

        console.log(parsed);

        simuloopCSV(
            algorithm.step,
            '0',
            250,
            1000/9,
            3000
        )
    });
}




// // test data generator
// function genData(
//     sps = 250, 
//     tduration = 1000, 
//     fn = (v, i, time) => Math.random(), 
//     tstart = Date.now()
// ) {
//     const maxSamples = Math.floor(sps * (tduration / 1000));
//     return new Array(maxSamples).fill(0).map((v, i) => {
//         const time = tstart + 1000 * i / sps;
//         return fn(v, i, time);
//     });
// }

// const simuloop = (

//     eventDetector=algorithm.step, //step function, has its own scope for keeping buffers etc
//     sps = 250, //sample rate
//     tcheck = 1000 / 9, // 9 checks per second
//     duration = 5000,
//     dataGen = (v, i, time) => Math.random()

// ) => {

//     let tstart = Date.now();
//     let start = tstart;
//     const recursiveAwait = async () => {
//         const data = { 
//           channel: genData(
//                 sps, 
//                 tcheck, 
//                 dataGen, 
//                 tstart
//             ) 
//         };
//         console.log('data', data);
//         const result = eventDetector(data);
//         console.log("check result:", result);
//         tstart += tcheck;
//         if (tstart <= start + duration) {
//             await new Promise(res => setTimeout(res, tcheck));
//             recursiveAwait();
//         }
//     };
//     recursiveAwait();

// };

//simuloop(algorithm.step);
