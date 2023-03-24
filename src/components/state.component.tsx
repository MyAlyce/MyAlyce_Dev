import React, { Component } from 'react'
import { EventHandler, state } from 'graphscript';

//These components share their state with the global state provided by graphscript's EventHandler, 
//  and changes propagate both directions with setState on the component state or global state

// It assumes all state keys are to be shared with global state, 
//    so if you want unique properties on this component, enforce a random Id, qhich we provided with this.unique, e.g. state = { [this.unique+'.textColor']:'blue' }

export class sComponent extends Component<{[key:string]:any}> {

    statemgr = state;
    UPDATED = [] as any;
    unique = `component${Math.floor(Math.random()*1000000000000000)}`;

    constructor(
        props:{
            [key:string]:any,
            state?:EventHandler
        }={
            state:state //can apply a new state other than the global state so you can have states for certain pages for example
        }
    ) {
        super(props);

        if(props.state) //synced with global state
            this.statemgr = props.state;

        //lets overload setState
        let react_setState = this.setState.bind(this);
        
        this.setState = (s:any) => {

            this.UPDATED = Object.keys(s);
            react_setState(s);
            if(typeof s === 'object') {            
               state.setState(s); //now relay through event handler
            }
        }

        setTimeout(()=>{
            let found = {};
            for(const prop in this.state) { //for all props in state, subscribe to changes in the global state
                if(prop in this.statemgr.data) found[prop] = this.statemgr.data[prop];

                let sub = this.statemgr.subscribeEvent(prop,(res)=>{
                    let c = this;
                    if(typeof c === 'undefined') { //the class will be garbage collected by react and this will work to unsubscribe
                        this.statemgr.unsubscribeEvent(prop, sub);
                    }
                    else {
                        let wasupdated = this.UPDATED.indexOf(prop);
                        if( wasupdated > -1) {
                            this.UPDATED.splice(wasupdated,1);
                        }
                        else {
                             react_setState({[prop]:res});//only updates one prop at a time rn
                        }
                    }
                });
            }
            if(Object.keys(found).length > 0) react_setState(found); //override defaults
        },0.001);
        
    }

}