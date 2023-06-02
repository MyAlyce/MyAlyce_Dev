import React from 'react'
import { defaultProfilePic } from '../../scripts/client'

export function Avatar(props:{pictureUrl:string, width?:number, onlineStatus?:boolean}) {

    let defaultWidth = 50;

    return(<>
        <span>
            <img 
                className="rounded-circle" 
                width={props.width ? props.width+'px' : defaultWidth + "px"} 
                src={props.pictureUrl ? props.pictureUrl : defaultProfilePic} 
            />
            {(typeof props.onlineStatus === 'boolean') ? 
                <span style={{
                    position:'absolute', 
                    transform:`translateX(-${(props.width ? props.width*.25+'px' : defaultWidth*.25 + "px")})`,
                    width:props.width ? props.width*.25+'px' : defaultWidth*.25 + "px", 
                    height:props.width ? props.width*.25+'px' : defaultWidth*.25 + "px", 
                    borderRadius:props.width ? props.width*.125+'px' : defaultWidth*.125 + "px", 
                    backgroundColor:props.onlineStatus ? 'chartreuse' : 'gray'}
                }></span> : null}
        </span>
        </>);
}