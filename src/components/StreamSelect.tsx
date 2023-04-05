import React from 'react'
import { sComponent } from "./state.component";


export class StreamSelect extends sComponent {
   
    state = { //synced with global state
        availableStreams:{},
        activeStream:undefined
    }
    
    render() {
        
        let onchange = (ev) => {
            let value = ev.target.value;
            this.setState({activeStream:value});
        }

        return (
            <div>
                Select Stream:
                <select onChange={onchange}>
                    <option value={undefined}>My Device</option>
                    { Object.keys(this.state.availableStreams).length > 0 &&
                        Object.keys(this.state.availableStreams).map((key) => {
                            return (<option key={key} value={key}>{this.state.availableStreams[key].firstName ? this.state.availableStreams[key].firstName : this.state.availableStreams[key]._id} {this.state.availableStreams[key].lastName ? this.state.availableStreams[key].lastName : ""}</option>)  
                        })
                    }
                </select>
            </div>
        )
    }
}