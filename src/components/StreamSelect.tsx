import React from 'react'
import { sComponent } from "./state.component";


export class StreamSelect extends sComponent {
   
    state = { //synced with global state
        availableStreams:{},
        activeStream:undefined
    }

    onchange=()=>{}

    constructor(props:{onChange:()=>void}) {
        super(props);
        if(props?.onChange) 
            this.onchange = props.onChange;
    }
    
    render() {
        
        let onchange = (ev) => {
            let value = ev.target.value;
            this.setState({activeStream:value});
            this.onchange();
        }

        return (
            <div>
                <select onChange={onchange}>
                    <option selected={this.state.activeStream == undefined} value={undefined}>My Device</option>
                    { Object.keys(this.state.availableStreams).length > 0 &&
                        Object.keys(this.state.availableStreams).map((key) => {
                            return (
                                <option 
                                    selected={this.state.activeStream === key} 
                                    key={key} 
                                    value={key}
                                >{this.state.availableStreams[key].firstName ? this.state.availableStreams[key].firstName : this.state.availableStreams[key]._id} {this.state.availableStreams[key].lastName ? this.state.availableStreams[key].lastName : ""}
                                </option>
                            );  
                        })
                    }
                </select>
            </div>
        )
    }
}