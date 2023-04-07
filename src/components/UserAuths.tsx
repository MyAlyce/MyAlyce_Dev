import React from 'react'
import { sComponent } from './state.component'
import { client } from '../scripts/client';
import { Avatar } from '../components/lib/src/index';
import { AuthorizationStruct } from 'graphscript-services/struct/datastructures/types';

let personIcon = './assets/person.jpg';

export class UserAuths extends sComponent {

    state = {
        viewingId:undefined
    }

    queryResults = [] as any[];
    existingAuths = [] as any[];

    constructor() {
        super();

        this.listAuths();

    }

    queryUsers(ev) {
        let query = ev.target.value;
        this.queryResults = [];
        client.queryUsers(query, 0, 0).then((res) => {
            res?.forEach((user) => {
                this.queryResults.push(
                    <option value={user._id}>
                        <Avatar
                            dataState='done'
                            imgSrc={user.pictureUrl ? user.pictureUrl : {personIcon}}
                            size='xs'
                            name={
                                {
                                    first:user.firstName as string,
                                    last:user.lastName as string,
                                }
                            }
                            backgroundColor='lightblue'
                        /> {user.firstName} {user.lastName}
                    </option>
                );
            })
        });

        this.render();
    }

    createAuth = () => {
        let select = document.getElementById(this.unique+'select') as HTMLSelectElement;
        let userId = select.value;
        let name = select.options[select.selectedIndex].innerText;
        
        //quickly grant two-way permissions, the other user must initiate as well.
        //granting
        client.authorizeUser(
            client.currentUser,
            client.currentUser._id,
            'Me',
            userId,
            name,
            { 'peer':true }
        ).then(()=>{
            //asking
            client.authorizeUser(
                client.currentUser,
                userId,
                name,
                client.currentUser._id,
                'Me',
                { 'peer':true }
            ).then(()=>{ 
                this.listAuths();
            });
            
        });

        //todo, send a notification to the other user to add them

    }

    listAuths = () =>  {
        this.existingAuths = [];
        client.getAuthorizations().then((auths) => {
            auths?.forEach((a:AuthorizationStruct) => {
                this.existingAuths.push(
                    <tr>
                        <td>Permissions: ${Object.keys(a.authorizations).map((key)=>{
                            return `${key}:${(a.authorizations as any)[key]}`; //return true authorizations
                        })}</td>
                        <td>Authorized: ${a.authorizedName}</td>
                        <td>Authorizer: ${a.authorizerName}</td>
                        <td>Status: ${a.status}</td>
                    </tr>
                )
            })
        }); //get own auths
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
                            { this.queryResults.map(v => v) }
                        </select>
                    </div>
                </div>
                <div>
                    Authorized:
                    <div>

                    </div>
                </div>
            </div>
        )
    }

}