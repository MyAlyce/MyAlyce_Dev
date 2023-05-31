import React from 'react';
import { sComponent } from '../state.component';


//str8 text render
export class StreamText extends sComponent{

    state = {};

    stateKey:string;
    objectKey?:string; // if our state result is an object

    sub:number;

    constructor(props:{stateKey:string, objectKey?:string}) {
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

        let result = this.objectKey ? this.state[this.stateKey]?.[this.objectKey] : this.state[this.stateKey];

        return (<>{typeof result === 'number' ? result.toFixed(3) : result}</>)
    }
}