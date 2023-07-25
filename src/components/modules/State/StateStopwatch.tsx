import React, {Component} from 'react'
import {state} from '../../../scripts/client'
import { Button } from 'react-bootstrap';

export class Stopwatch extends Component<{
    stateKey?:string,
    onStart?:(timestamp)=>void,
    onStop?:(duration,timestamp)=>void,
    onFrame?:(duration,timestamp)=>void,
    onClear?:(duration,timestamp)=>void
}> {

    state = {
        running:false
    }

    unique = 'stopwatch'+Math.floor(Math.random()*10000000000000);
    stateKey = 'timer_';

    constructor(props) {
        super(props);
        if(props.stateKey) this.stateKey = props.stateKey;
        if(!((`${this.stateKey}timeRunning`) in state.data)) state.data[this.stateKey+'timeRunning'] = 0;
        if(!((`${this.stateKey}timeStart`) in state.data)) state.data[this.stateKey+'timeStart'] = 0;
        if(!((`${this.stateKey}running`) in state.data)) {
            state.data[this.stateKey+'running'] = false;
        }
            
    }

    componentWillUnmount(): void {
        //if(state.data[this.stateKey+'animationLoop']) 
            //cancelAnimationFrame(state.data[this.stateKey+'animationLoop']);
    }

    startTimer() {
        if(!state.data[this.stateKey+'animationLoop']) {
            state.data[this.stateKey+'timeStart'] = performance.now();
            if(this.props.onStart) this.props.onStart(Date.now());
            let getTime = () => {
                let now = performance.now();
                state.data[this.stateKey+'timeRunning'] = now - state.data[this.stateKey+'timeStart'];
                let elm = (document.getElementById(this.stateKey+'time') as HTMLElement);
                if(elm) 
                    elm.innerText = hhmmssms(state.data[this.stateKey+'timeRunning']);

                if(this.props.onFrame) this.props.onFrame(state.data[this.stateKey+'timeRunning'], Date.now());
                
                state.data[this.stateKey+'animationLoop'] = requestAnimationFrame(getTime);
            }

            getTime();
        }
        state.data[this.stateKey+'running'] = true;
        this.setState({});
    }

    stopTimer() {
        if(this.props.onStop) this.props.onStop(state.data[this.stateKey+'timeRunning'], Date.now());
        if(state.data[this.stateKey+'animationLoop']) cancelAnimationFrame(state.data[this.stateKey+'animationLoop']);
        state.data[this.stateKey+'animationLoop'] = undefined;
        state.data[this.stateKey+'running'] = false;
        this.setState({});
    }

    clearTimer() {
        if(this.props.onClear) this.props.onClear(state.data[this.stateKey+'timeRunning'], Date.now());
        state.data[this.stateKey+'timeStart'] = performance.now();
        state.data[this.stateKey+'timeRunning'] = 0;
        this.setState({});
    }

    render() {
        return (
        <span>
        { state.data[this.stateKey+'running'] ? 
            <Button onClick={()=>{this.stopTimer();}}>Stop</Button> :
            <Button onClick={()=>{this.startTimer();}}>Start</Button>
        }
        { (state.data[this.stateKey+'running'] || state.data[this.stateKey+'timeRunning'] > 0) && 
            <Button onClick={()=>{this.clearTimer();}}>Clear</Button>
        }
            <span id={this.stateKey+'time'}>{hhmmssms(state.data[this.stateKey+'timeRunning'])}</span>
        </span>
        )
    }

}


export function hhmmssms(timeInMs) {
    let pad = function(num, size) { return ('000' + num).slice(size * -1); };
    let time = timeInMs / 1000;
    let hours = Math.floor(time / 60 / 60);
    let minutes = Math.floor(time / 60) % 60;
    let seconds = Math.floor(time - minutes * 60);
    let milliseconds = time.toFixed(3).slice(-3);

    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + ',' + pad(milliseconds, 3);
}