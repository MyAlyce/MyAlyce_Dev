import React from 'react'
import { defaultProfilePic } from '../../scripts/client'

export function Avatar(props:{pictureUrl:string,width?:string}) {
    return(<img 
        className="rounded-circle" 
        width={props.width ? props.width : "50"} 
        src={props.pictureUrl ? props.pictureUrl : defaultProfilePic} 
    />);
}