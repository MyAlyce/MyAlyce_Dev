import React, {Component} from 'react'
import { Button } from '../lib/src';

export type FormInputSettings = {
    type:'text' | 'number' | 'email' | 'password' | 
        'date' | 'file' | 'datetime-local' | 'checkbox' | 
        'color' | 'Button' | 'radio' | 'range' | 'search' | 
        'submit' | 'url' | 'month' | 'week' | 'hidden' |
        'image' | 'reset' | 'time' | 'tel',
    name:string,
    label?:string,
    required?:boolean,
    placeholder?:any,
    value?:any,
    onInput?:(event:any)=>void,
    inputClass?:string,
    labelClass?:string
};

export type FormProps = {
    inputs:FormInputSettings[],
    custom?:JSX.Element, //whatever inputs etc.
    onSubmit?:(id:string)=>void,
    submitClass?:string,
    onCancel?:(id:string)=>void,
    cancelClass?:string
};

export function checkValidity(
    formId:string, 
    isValid:(elem:HTMLInputElement)=>void = (elem) => {elem.style.backgroundColor='white'; return;}, 
    isInvalid:(elem:HTMLInputElement)=>void = (elem) => {elem.style.backgroundColor='tomato'; return;}
) {
    if(!formId) return;

    let valid = true;
    for (const el of (document.getElementById(formId) as HTMLFormElement).querySelectorAll("[required]")) {
        
        if (!(el as HTMLInputElement).reportValidity()) {
            //highlight the element
            isInvalid(el as HTMLInputElement);
            valid = false;
        } else { 
            isValid(el as HTMLInputElement);
        }
    }

    return valid;
}

//let setting = new FormInputSetting(


export class FormInputSetting {
    type; name; required; placeholder; value; onInput; label; inputClass; labelClass; 

    constructor(
        type:'text' | 'number' | 'email' | 'password' | 
        'date' | 'file' | 'datetime-local' | 'checkbox' | 
        'color' | 'Button' | 'radio' | 'range' | 'search' | 
        'submit' | 'url' | 'month' | 'week' | 'hidden' |
        'image' | 'reset' | 'time' | 'tel',
        name:string,
        label?:string,
        required?:boolean,
        placeholder?:any,
        value?:any,
        onInput?:(event:any)=>void,
        inputClass?:string,
        labelClass?:string
    ) {
        this.type = type;
        this.name = name;
        this.label = label;
        this.required = required;
        this.placeholder = placeholder;
        this.value = value;
        this.onInput = onInput;
        this.inputClass = inputClass;
        this.labelClass = labelClass;
    };
}

export class FormTemplate extends Component<FormProps> {

    id=`form${Math.floor(Math.random()*1000000000000000)}`;

    render() {
        return (
            <form id={this.id}>
                {this.props.inputs.map((setting) => {
                    return (
                        <>
                            {setting.label && <label htmlFor={setting.name} className={setting.labelClass}>{setting.label} </label>}
                            <input type={setting.type} name={setting.name} id={this.id+setting.name} className={setting.inputClass} required={setting.required} onInput={setting.onInput}></input>
                        </>
                    )
                })}
                {this.props.custom && this.props.custom}
                {this.props.onSubmit && 
                    <Button id={this.id+'submit'} className={this.props.submitClass} onClick={()=>{(this.props.onSubmit as any)(this.id)}}>✔️</Button>
                }
                {this.props.onCancel &&
                    <Button id={this.id+'cancel'} className={this.props.cancelClass} onClick={()=>{(this.props.onCancel as any)(this.id)}}>❌</Button>
                }
            </form>
        )
    }
}
 