import { graph } from '../client'
import { workers } from 'device-decoder';

import gsworker from '../device.worker'

export function throwAlertSound() {

}

export class Alert {

    sub?:number;
    [key:string]:any;

    constructor( //we will extend this class and super() the base class
        name:string, 
        subscribeTo:string, 
        onEvent:(event) => void,
        check?:(data:any) => any|undefined,
        props?:{}
    ) {
        this.__node = { tag: name };
        if(check) this.check = check;
        else this.check = function (data:any) {
            console.log('data', data); 
    
            return undefined; //this won't throw a result to the main thread if undefined, to save some cpu
        }
        if(props) Object.assign(this,props);

        this.__operator = function (data) {
            return this.check(data);
        }

        let worker = workers.addWorker({url:gsworker});

        console.log(Object.keys(this));
        
        let transferred = graph.run('transferNode',
            this,
            worker,
            name
        );

        this.sub = graph.subscribe(subscribeTo, (data) => {
            worker.post(name, data);
        });

        worker.subscribe(name, (ev) => {
            onEvent(ev);
        })

        //setup a callback for automatically terminating if the alert is removed from our local graph
        this.__ondisconnected = () => {
            graph.unsubscribe(subscribeTo, this.sub);
            this.sub = undefined;
            worker.terminate();
        }

    }

    
    

}
