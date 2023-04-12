import React from 'react'
import { sComponent } from '../state.component'
import { showNotification } from '../../scripts/alerts'
import { Button } from '../lib/src'

export class Dev extends sComponent {

    state = { //synced with global state
       
    }

    render() {

        return (
            <div className='div'>
            <h1>Browser Notification Example</h1>
            <Button onClick={()=>{showNotification("Hello World","Exmaple Notification")}}>Show Notification</Button>
          </div>
        )
    }

}
