import React from 'react'
import { sComponent } from '../state.component'
export class Dev extends sComponent {

    state = { //synced with global state
       
    }

    showNotification = () => {
        // Check if browser supports notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          // Create a notification
          new Notification('Hello, World!', {
            body: 'This is a notification example.',
            icon: 'favicon.ico',
          });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          // Request permission to show notifications
          Notification.requestPermission()
            .then(permission => {
              if (permission === 'granted') {
                // Create a notification
                new Notification('Hello, World!', {
                  body: 'This is a notification example.',
                  icon: 'favicon.ico',
                });
              }
            })
            .catch(error => {
              console.error('Failed to request notification permission:', error);
            });
        }
      };
    

    render() {

        return (
            <div>
            <h1>Browser Notification Example</h1>
            <button onClick={this.showNotification}>Show Notification</button>
          </div>
        )
    }

}
