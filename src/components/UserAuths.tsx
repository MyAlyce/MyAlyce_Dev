import React from 'react'
import { sComponent } from './state.component'


export class UAuth extends sComponent {

    state = {
        viewingId:undefined
    }

    queryUsers(ev) {
        let query = ev.target.value;
        
    }

    createAuth() {

    }

    render() {
        return (
            <div id={this.unique}>
                <div>
                    Search Users<br/>
                    Name or Email:<input  id={this.unique+'query'} onChange={this.queryUsers} />
                </div>
                <div>
                    Results:
                    <div>
                        <select id={this.unique+'select'}>
                        </select>
                    </div>
                </div>
            </div>
        )
    }

}