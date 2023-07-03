import React, {Component} from 'react'


export class Stopwatch extends Component<{
    onStart?:(timestamp)=>void,
    onStop?:(duration,timestamp)=>void,
    onFrame?:(duration,timestamp)=>void,
    onClear?:(duration,timestamp)=>void
}> {

    state = {
        running:false
    }

    timeStart = 0;
    timeRunning = 0;
    animationLoop;

    unique = 'stopwatch'+Math.floor(Math.random()*10000000000000);

    componentWillUnmount(): void {
        if(this.animationLoop) 
            cancelAnimationFrame(this.animationLoop);
    }

    startTimer() {
        if(!this.animationLoop) {
            this.timeStart = performance.now();
            if(this.props.onStart) this.props.onStart(Date.now());
            let getTime = () => {
                let now = performance.now();
                this.timeRunning = now - this.timeStart;
                (document.getElementById(this.unique+'time') as HTMLElement).innerText = hhmmssms(this.timeRunning);

                if(this.props.onFrame) this.props.onFrame(this.timeRunning, Date.now());
                this.animationLoop = requestAnimationFrame(getTime);
            }

            getTime();
        }
        this.setState({running:true});
    }

    stopTimer() {
        if(this.props.onStop) this.props.onStop(this.timeRunning, Date.now());
        if(this.animationLoop) cancelAnimationFrame(this.animationLoop);
        this.animationLoop = undefined;
        this.setState({running:false});
    }

    clearTimer() {
        if(this.props.onClear) this.props.onClear(this.timeRunning, Date.now());
        this.timeStart = performance.now();
        this.timeRunning = 0;
        this.setState({});
    }

    render() {
        return (
        <span>
        { this.state.running ? 
            <button onClick={()=>{this.stopTimer();}}>Stop</button> :
            <button onClick={()=>{this.startTimer();}}>Start</button>
        }
        { (this.state.running || this.timeRunning > 0) && 
            <button onClick={()=>{this.clearTimer();}}>Clear</button>
        }
            <span id={this.unique+'time'}>{hhmmssms(this.timeRunning)}</span>
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