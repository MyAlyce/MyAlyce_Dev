import React from 'react';
import { sComponent } from '../../state.component';


//str8 text render
export class StreamText extends sComponent{

    state = {};

    stateKey:string;
    objectKey?:string; // if our state result is an object

    sub:number;

    movingAverage = [] as any;

    constructor(props:{stateKey:string, objectKey?:string, movingAverage?:number, toFixed?:number}) {
        super(props);
        this.stateKey = props.stateKey;
        this.objectKey = props.objectKey;
    }

    componentDidMount() {
        this.sub = this.__subscribeComponent(this.stateKey);
        this.state[this.stateKey] = this.statemgr.data[this.stateKey];
    }

    componentWillUnmount() {
        this.__unsubscribeComponent(this.stateKey);
    }

    render() {

        let res = this.objectKey ? this.state[this.stateKey]?.[this.objectKey] : this.state[this.stateKey];

        let withResult = (result) => {
            if(typeof result === 'string') {
                result = parseFloat(result);
            }
    
            if(typeof result === "number" && this.props.movingAverage) {
                this.movingAverage.push(result);
                
                if(this.movingAverage.length > this.props.movingAverage) {
                    this.movingAverage.shift();
                }
    
                const sum = this.movingAverage.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    
                result = sum / this.movingAverage.length;
            }

            return result;
        } 

        if(Array.isArray(res) && this.props.movingAverage) {
            let t;
            res.forEach((v) => {
                t = withResult(v);
            });
            res = t;
        } else res = withResult(res);
        

        return (<>{typeof res === 'number' ? res.toFixed(this.props.toFixed ? this.props.toFixed : 2) : res}</>)
    }
}