import React from 'react'
import { sComponent } from '../state.component'
import { showNotification } from '../../scripts/alerts'
export class Dev extends sComponent {

    state = { //synced with global state
       
    }


    

    render() {

        return (
            <div>
            <h1>Browser Notification Example</h1>
            <button onClick={()=>{showNotification("Hello World","Exmaple Notification")}}>Show Notification</button>
          </div>
        )
    }

}
