import { 
    WorkerService, 
    remoteGraphRoutes, 
    workerCanvasRoutes, 
    nodeTemplates
    //GPUService, 
} from 'graphscript'//'../../../graphscript/index'//

import { webglPlotRoutes } from 'graphscript-services'; //"../../../graphscript/extras/index.services"//

import { streamWorkerRoutes } from 'device-decoder/src/stream.routes';
import {Devices} from 'device-decoder'

import { 
    csvRoutes,
    BFSRoutes,
    fs
 } from 'graphscript-services.storage'//'../../../graphscript/src/extras/index.storage.services'//

import {
    algorithms
} from 'graphscript-services'

import { checkFolderList } from './folders';

Object.assign(nodeTemplates, algorithms);

// import {
//     gpualgorithms
// } from 'graphscript-services.gpu'
 //'graphscript-services'; //

//Object.assign(nodeTemplates, gpualgorithms);


declare var WorkerGlobalScope;

if(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    
    globalThis.Devices = Devices; //access all devices incl third party (bloated)

    const worker = new WorkerService({
        //props:{} //could set the props instead of globalThis but it really does not matter unless you want to bake in for more complex service modules
        roots:{
            //GPUService as any,
            ...workerCanvasRoutes,
            //unsafeRoutes, //allows dynamic route loading
            ...remoteGraphRoutes,
            ...BFSRoutes,
            ...csvRoutes,
            ...streamWorkerRoutes,
            ...webglPlotRoutes,
            checkFolderList:checkFolderList,
            deletefolder:async function (foldername) {
                fs.rmdir(foldername);
                return true;
            },
            processHRSession:async function (filename, outpfile) {

                if(!filename || !outpfile) return false;
                let minhr = Infinity;
                let maxhr = -Infinity;
                let minhrv = Infinity;
                let maxhrv = -Infinity;

                //accumulate and average
                let hraccum = 0;
                let hrvaccum = 0;

                let nsamples = 0;

                let tstart, tend;
                
                //take an average at start and end to set a "session gain"
                let hrvalues = [] as any[];
                let hrvvalues = [] as any[];
                let timestamps = [] as any[];

                if(await BFSRoutes.exists(filename)) {

                    await csvRoutes.processCSVChunksFromDB(filename, async (csvdata:any,start,end,size) => {
                        //accumulate
                        csvdata.hr?.map((v,i) => {
                            v = parseFloat(v);
                            csvdata.hrv[i] = parseFloat(csvdata.hrv[i]);
                            hraccum += v;
                            hrvaccum += csvdata.hrv[i];
                            nsamples++;
    
                            if(minhr > v) minhr = v;
                            else if(maxhr < v) maxhr = v;
                            if(minhrv > csvdata.hrv[i]) minhrv = csvdata.hrv[i];
                            else if (maxhrv < csvdata.hrv[i]) maxhrv = csvdata.hrv[i];
    
                            hrvalues.push(v);
                            hrvvalues.push(csvdata.hrv[i]);
                            timestamps.push(parseInt(csvdata.timestamp[0]));
                        });
    
    
                        if(!tstart) tstart = parseInt(csvdata.timestamp?.[0]);
                        
                        if(end === size && nsamples > 0) {
    
                            tend = parseInt(csvdata.timestamp?.[csvdata.timestamp.length-1]);
                            let hravg = hraccum / nsamples;
                            let hrvavg = hrvaccum / nsamples; 
                            let tlength = tend - tstart;
    
                            let nsamples_10 = Math.floor(nsamples/10);;
    
                            let hrslope;
                            let hrvslope;
    
                            if(nsamples_10 > 0) {
    
                                let initialhrAvg = 0;
                                let endhrAvg = 0;
                                let initialhrvAvg = 0;
                                let endhrvAvg = 0;
    
                                for(let i = 0; i < nsamples_10; i++) {
                                    initialhrAvg += hrvalues[i];
                                    endhrAvg += hrvalues[hrvalues.length - 1 - i];
                                    initialhrvAvg += hrvvalues[i];
                                    endhrvAvg += hrvvalues[hrvvalues.length - 1 - i];
                                }
    
                                initialhrAvg    /= nsamples_10;
                                endhrAvg        /= nsamples_10;
                                
                                initialhrvAvg   /= nsamples_10;
                                endhrvAvg       /= nsamples_10;
    
                                hrslope  = (endhrAvg - initialhrAvg) / initialhrAvg;
                                hrvslope = (endhrvAvg - initialhrvAvg) / initialhrvAvg; 
                            }

                            let toAppend = { 
                                timestamp:tend,
                                hravg, 
                                minhr,
                                maxhr,
                                hrgain:hrslope, 
                                hrvavg,
                                minhrv,
                                maxhrv, 
                                hrvgain:hrvslope, 
                                durationms:tlength 
                            }
    
    
                            await csvRoutes.appendCSV(toAppend, outpfile, undefined, { toFixed:2, bufferSize:0 });
    
                        }
                        
                        //heart rate stats,
    
                        //hrv stats
    
                        //min, max, slope (gain), average
                    });
                    return true;
                } else return false;
            },
            processBRSession:async function (filename, outpfile) {

                if(!filename || !outpfile) return false;
                let minbr = Infinity;
                let maxbr = -Infinity;
                let minbrv = Infinity;
                let maxbrv = -Infinity;

                //accumulate and average
                let braccum = 0;
                let brvaccum = 0;

                let nsamples = 0;

                let tstart, tend;
                
                //take an average at start and end to set a "session gain"
                let brvalues = [] as any[];
                let brvvalues = [] as any[];
                let timestamps = [] as any[];

                if(await BFSRoutes.exists(filename)) {
                    await csvRoutes.processCSVChunksFromDB(filename, async (csvdata:any,start,end,size) => {
                        //accumulate
                        csvdata.breath?.map((v,i) => {
                            v = parseFloat(v);
                            csvdata.brv[i] = parseFloat(csvdata.brv[i]);
                            braccum += v;
                            brvaccum += csvdata.brv[i];
                            nsamples++;
    
                            if(minbr > v) minbr = v;
                            else if(maxbr < v) maxbr = v;
                            if(minbrv > csvdata.brv[i]) minbrv = csvdata.brv[i];
                            else if (maxbrv < csvdata.brv[i]) maxbrv = csvdata.brv[i];
    
                            brvalues.push(v);
                            brvvalues.push(csvdata.brv[i]);
                            timestamps.push(parseInt(csvdata.timestamp[0]));
                        });
    
    
                        if(!tstart) tstart = csvdata.timestamp?.[0];
                        
                        if(end === size && nsamples > 0) {
    
                              
                            tend = csvdata.timestamp?.[csvdata.timestamp.length-1];
                            let bravg = braccum / nsamples;
                            let brvavg = brvaccum / nsamples; 
                            let tlength = tend - tstart;
    
                            let nsamples_10 = Math.floor(nsamples/10);;
    
                            let brslope;
                            let brvslope;
    
                            if(nsamples_10 > 0) {
    
                                let initialbrAvg = 0;
                                let endbrAvg = 0;
                                let initialbrvAvg = 0;
                                let endbrvAvg = 0;
    
                                for(let i = 0; i < nsamples_10; i++) {
                                    initialbrAvg += brvalues[i];
                                    endbrAvg += brvalues[brvalues.length - 1 - i];
                                    initialbrvAvg += brvvalues[i];
                                    endbrvAvg += brvvalues[brvvalues.length - 1 - i];
                                }
    
                                initialbrAvg    /= nsamples_10;
                                endbrAvg        /= nsamples_10;
                                
                                initialbrvAvg   /= nsamples_10;
                                endbrvAvg       /= nsamples_10;
    
                                brslope  = (endbrAvg - initialbrAvg) / initialbrAvg;
                                brvslope = (endbrvAvg - initialbrvAvg) / initialbrvAvg; 
                            }
    
                            await csvRoutes.appendCSV({ 
                                timestamp:tend,
                                bravg, 
                                minbr,
                                maxbr,
                                brgain:brslope, 
                                brvavg,
                                minbrv,
                                maxbrv, 
                                brvgain:brvslope, 
                                durationms:tlength 
                            }, outpfile, undefined, { toFixed:2, bufferSize:0 });
                            
                        }
                        
                        //heart rate stats,
    
                        //brv stats
    
                        //min, max, slope (gain), average
                    });
                    return true;
                } else return false;
            }
        }
    });

    //console.log('worker', worker)
    
}

export default self as any;
