import React, {Component} from 'react'
import { StreamDefaults, Streams } from '../../scripts/client';
import { ButtonGroup, ToggleButton } from 'react-bootstrap';

export class StreamToggle extends Component<{
    toggled?:Partial<Streams>|undefined,
    subscribable?:Partial<Streams>|undefined,
    onChange:(ev:{key:string,checked:boolean}) => void,
    onlyOneActive?:boolean
}> {

    state={
        onChange: (ev:{key:string,checked:boolean}) => {},
        subscribable: [...StreamDefaults] as any as Partial<Streams>,
        toggled: [...StreamDefaults] as any as Partial<Streams>,
        defaultValue: [] as number[]
    }

    constructor(props) {
        super(props);
        
        console.log("StreamToggle Constructor!!")

        if(this.props.subscribable) this.state.subscribable = this.props.subscribable;
        if(this.props.toggled) {
            this.state.toggled = this.props.toggled; 
            this.state.toggled.forEach((v) => {
                let idx = this.state.subscribable.indexOf(v);
                if(idx > -1) {
                    this.state.defaultValue.push(idx);
                }
            })
        }
        
        if(this.props.onChange) this.state.onChange = this.props.onChange;
    }

    componentDidMount(): void {
    }

    render() {

        return (
            <ButtonGroup className="mb-2">
                {
                    this.state.subscribable.map((v: any, i) => {
                        return <ToggleButton
                            id={v}
                            key={v}
                            value={i}
                            checked={this.state.toggled.indexOf(v) > -1}
                            type={this.props.onlyOneActive ? "radio" : "checkbox"} 
                            onChange={(ev:any)=>{ 
                                let idx = this.state.toggled.indexOf(v);
                                if(idx < 0) {
                                    if(this.props.onlyOneActive) {
                                        this.state.toggled.forEach((j:any) => {
                                            this.state.onChange({key:j, checked:false});
                                        });
                                        this.state.toggled.length = 0;
                                        this.state.toggled.push(v);
                                        if(this.state.onChange) 
                                            this.state.onChange({key:v,checked:true});

                                        this.setState({});
                                    } else {
                                        this.state.toggled.push(v);
                                        if(this.state.onChange) 
                                            this.state.onChange({key:v,checked:true});
                                    }
                                }
                                else {
                                    if(!this.props.onlyOneActive) {
                                        this.state.toggled.splice(idx, 1);
                                        if(this.state.onChange) 
                                            this.state.onChange({key:v,checked:false});
                                    }
                                }
                            }}
                        >{(v as string).toUpperCase()}</ToggleButton>
                    })
                }
            </ButtonGroup>
        );

    }
}