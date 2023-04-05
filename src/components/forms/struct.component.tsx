import React, {Component} from 'react'
import { FormInputSettings, FormTemplate, FormInputSetting, checkValidity } from './form.component';
import { structRegistry, Struct } from 'graphscript-services/struct/datastructures/DataStructures';
import { client } from '../../scripts/client'

type StructFormProps = {
    structType:string|undefined,
    ownerId:string,
    custom?:JSX.Element|undefined,
    inputs?:FormInputSettings[]
};

//this is a form generator for structs

function findStructBuilder(structType:string) {
    if(!structType) return undefined;
    return  Object.keys(structRegistry).find((r:string) => {
        if(r.toLowerCase().includes(structType)) return true;
        else return false;
    });
} 
//generate a struct form based on an existing type
export function genStructForm(structType:'struct', ownerId:string, inputClass?:string, labelClass?:string) {

    let structkey = findStructBuilder(structType);

    let struct:any;

    if(!structkey) return;
    else {
        struct = (structRegistry as any)[structkey]() as any;
    }

    let inputs:FormInputSettings[] = [];

    let customInputs:JSX.Element|undefined = undefined;
    
    Object.keys(struct).forEach((key) => {
        let setting;
        if((typeof struct[key] === 'string' || typeof struct[key] === 'number') && !(key === '_id' || key === 'structType' || key === 'ownerId')) {
            let inptype = 'text';
            if(key === 'timestamp') inptype = 'datetime-local';
            else if(typeof struct[key] === 'number') inptype = 'number'
            setting = new FormInputSetting(
                inptype as any,
                key,
                key,
                undefined,
                struct[key],
                struct[key],
                undefined,
                inputClass,
                labelClass
            );
            
        }
        else if (key === 'data') {
            //build a selector for adding data structs
        }
        else if (key === 'users') {
            //build a selector for adding user ids who will be notified for this struct
        }
        
        if(setting) inputs.push(setting);
    })
    

    return <StructForm
        structType={structType}
        custom={customInputs}
        ownerId={ownerId}
        inputs={inputs}
    />
}

export class StructForm extends Component<StructFormProps> {

    id=`structform${Math.floor(Math.random()*1000000000000000)}`;

    inputs:FormInputSettings[]=[];

    constructor(props:StructFormProps) {
        super(props);
        if(!props.structType) this.inputs.push(
            new FormInputSetting(
                'text',
                'structType',
                'Struct Type',
                true,
                'struct',
                'struct'
            )
        ); //for untypes structs make it so we can add/remove arbitrary form inputs
        if(props.inputs) this.inputs.push(...props.inputs);
    }


    onSubmit = async (id:string) => {

        let valid = checkValidity(
            id,
            undefined,
            (el)=>{(el as HTMLElement).style.backgroundColor = `rgb(200,100,100)`;}
        ); //e.g.})

        if(!valid) return;

        let struct:any;
        let structbuilder = findStructBuilder(this.props.structType as string);
        
        if(!this.props.structType || !structbuilder) struct = Struct(undefined,undefined,{_id:this.props.ownerId});
        else struct = (structRegistry as any)[structbuilder as string](undefined,undefined,{_id:this.props.ownerId});

        this.inputs.forEach((setting) => {
            struct[setting.name] = (document.getElementById(id+setting.name) as HTMLInputElement).value;
            if(setting.type === 'number' && typeof struct[setting.name] == 'string') struct[setting.name] = parseFloat(struct[setting.name]);
        });

        await client.setData(struct as any);
    }   

    onCancel=(id:string) => {
        for (const el of (document.getElementById(id) as HTMLFormElement).querySelectorAll("input")) {
            el.value = ""; //reset values
        }
    }

    render() {
        return (
            <FormTemplate
                inputs={this.inputs}
                onSubmit={this.onSubmit}
                onCancel={this.onCancel}
                custom={this.props.custom}
            ></FormTemplate>
        );
    }
}


//make a form template
// make form input settings for each struct input
//  append arbitrary inputs to set arbitrary props on the struct
//   submit returns and/or writes the struct to the server