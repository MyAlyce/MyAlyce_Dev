import React from 'react'
import {sComponent} from '../../state.component'

export class StateButton extends sComponent {

    stateKey:string;

    constructor(props:{stateKey:string, style?:CSSStyleDeclaration, className?:string, trueText:string, falseText:string}) {
        super(props);
    }

    //trigger a boolean switch in state
    componentDidMount(): void {
        this.__subscribeComponent(this.props.stateKey);
    }

    componentWillUnmount(): void {
        this.__unsubscribeComponent(this.props.stateKey);
    }

    render() {

        return (<>
            {
                this.state[this.props.stateKey] ? 
                <button
                    onClick={()=>{this.setState({[this.props.stateKey]:false})}}
                    style={this.props.style} className={this.props.className}
                >{this.props.trueText ? this.props.trueText : 'Set False'}</button> 
                    :
                <button
                    onClick={()=>{this.setState({[this.props.stateKey]:true})}}
                    style={this.props.style} className={this.props.className}
                >{this.props.falseText ? this.props.falseText : 'Set True'}</button>
            }
            
        </>)

    }

}