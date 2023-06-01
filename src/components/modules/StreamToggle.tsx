import React, {Component} from 'react'
import { StreamDefaults, Streams } from '../../scripts/client';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

export class StreamToggle extends Component<{toggled?:Partial<Streams>|undefined,subscribable?:Partial<Streams>|undefined,onChange:(ev:{key:string,checked:boolean}) => void}> {

    onChange = (ev:{key:string,checked:boolean}) => {}

    subscribable = [...StreamDefaults] as any as Partial<Streams>;
    toggled = [...StreamDefaults] as any as Partial<Streams>;
    defaultValue = [] as number[];

    constructor(props) {
        super(props);
        if(props.subscribable) this.subscribable = props.subscribable;
        if(props.toggled) {
            this.toggled = props.toggled; 
            this.toggled.forEach((v) => {
                let idx = this.subscribable.indexOf(v);
                if(idx > -1) {
                    this.defaultValue.push(idx);
                }
            })
        }
        
        if(props.onChange) this.onChange = props.onChange;

        
    }

    render() {

        return (
            <ToggleButtonGroup type="checkbox" defaultValue={this.defaultValue} className="mb-2">
                {
                    this.subscribable.map((v: any, i) => {
                        return <ToggleButton
                            id={v}
                            key={v}
                            value={i}
                            onChange={(ev:any)=>{ 
                                let idx = this.toggled.indexOf(v);
                                console.log(v,idx,this.toggled);
                                if(idx < 0) {
                                    this.toggled.push(v);
                                    if(this.onChange) 
                                        this.onChange({key:v,checked:true});
                                }
                                else {
                                    this.toggled.splice(idx, 1);
                                    if(this.onChange) 
                                        this.onChange({key:v,checked:false});
                                }
                            }}
                        >{(v as string).toUpperCase()}</ToggleButton>
                    })
                }
            </ToggleButtonGroup>
        );

    }
}