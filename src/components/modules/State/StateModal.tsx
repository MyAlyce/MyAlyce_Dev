import React from 'react'
import Button from 'react-bootstrap/Button';
import M from 'react-bootstrap/Modal';
import { sComponent } from '../../state.component';


export class StateModal extends sComponent {
    
    state = {}
    
    showing = false;

    constructor(props:{
        stateKey:string,
        title?:any,
        body?:any,
        style?:React.CSSProperties,
        onClose?:Function,
        defaultShow?:boolean,

    }) {
        super(props);

        this.showing = props.defaultShow ? props.defaultShow : (this.statemgr.data[props.stateKey] == true);

        //console.log('subbing to',props.stateKey);
        
    }

    componentDidMount(): void {
        
        let callback = (res) => {
            if(res == true) { //e.g. a boolean or 0/1
                this.showing = true;
            } else if(res) { //e.g. a new value, so trigger to render show
                this.showing = true;
            } else {
                this.showing = false;
            }
            this.setState({});
        }

        this.__subscribeComponent(this.props.stateKey, callback);

    }

    componentWillUnmount(): void {
        this.__unsubscribeComponent(this.props.stateKey);
    }

    render() {
        return (
            <M centered show={this.showing} onHide={()=>{
                    this.showing = false; 
                    this.setState({}); 
                    if(this.props.onClose) this.props.onClose(); 
                }} backdrop={false} style={this.props.style ? this.props.style : undefined}
            >
                <M.Header closeButton>
                    {this.props.title && <M.Title>{this.props.title}</M.Title>}
                </M.Header>
                <M.Body>
                    { this.props.body }
                </M.Body>
                <M.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={()=>{
                            this.showing = false; 
                            this.setState({}); 
                            if(this.props.onClose) this.props.onClose(); }}
                        >Close
                    </Button>
                </M.Footer>
            </M>
        )
    }
        
        
}
    
