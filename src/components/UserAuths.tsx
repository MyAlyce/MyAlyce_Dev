import React from 'react'
import { sComponent } from './state.component'
import { client } from '../scripts/client';
import { Avatar } from '../components/lib/src/index';
import { AuthorizationStruct } from 'graphscript-services/struct/datastructures/types';

let personIcon = './assets/person.jpg';

export class UserAuths extends sComponent {

    state = {
        viewingId:undefined,
        authRequests:undefined
    }

    queryResults = [] as any[];
    existingAuths = [] as any[];
    sentRequests = [] as any[];
    userRequests = [] as any[];

    constructor() {
        super();

        this.listAuths();

    }

    queryUsers = () => {
        let query = (document.getElementById(this.unique + 'query') as HTMLInputElement).value;
        this.queryResults = [];
        if(query) {
            client.queryUsers(query, 0, 0).then((res) => {
                res?.forEach((user) => {
                    this.queryResults.push(
                        <option value={user._id}>
                            <Avatar
                                dataState='done'
                                imgSrc={user.pictureUrl ? user.pictureUrl : personIcon}
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
        }

        this.render();
    }

    authFromSelect = () => {

        let select = document.getElementById(this.unique+'select') as HTMLSelectElement;
        let userId = select.value;
        let name = select.options[select.selectedIndex].innerText;
        
        this.createAuth(userId,name);
    }

    createAuth = (userId, name, confirming=false) => {
        //quickly grant two-way permissions, the other user must initiate as well.
        //granting
        return new Promise((res,rej) => {
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

                    if(!confirming) client.addStruct(
                        'authRequest',
                        {
                            requesting:client.currentUser._id, //this will cause this user to receive a notification
                            receiving:userId,
                            receivingName:name,
                            users:[userId,client.currentUser._id],
                            firstName:client.currentUser.firstName,
                            lastName:client.currentUser.lastName,
                            authorizations:{ 'peer':true }
                        }
                    );

                    this.listAuths();
                    res(true);
                });
                
            });
        });
        //todo, send a notification to the other user to add them

    }

    listAuths = async () =>  {
        this.existingAuths = [];
        this.userRequests = [];
        this.sentRequests = [];

        await client.getAuthorizations().then((auths) => {
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

        //my requests
        await client.getData('authRequest', undefined, {requesting: client.currentUser._id}).then((authRequests) => {
            authRequests?.forEach((req:{
                requesting:string, //them
                receiving:string //me
                receivingName:string,
                users:string, //this will cause this user to receive a notification
                authorizations:{ 'peer':true },
                firstName:string,
                lastName:string
            }) => {

                let deleteRequest = () => {
                    client.deleteData([req]);
                }

                this.sentRequests.push(
                    <div>
                        To: {req.receivingName}
                        <button onClick={deleteRequest}>❌</button>
                    </div>
                );
            });
        })

        //other people's requests
        await client.getData('authRequest', undefined, {receiving: client.currentUser._id}).then((authRequests) => {
            authRequests?.forEach((req:{
                requesting:string, //them
                receiving:string //me
                receivingName:string,
                users:string, //this will cause this user to receive a notification
                authorizations:{ 'peer':true },
                firstName:string,
                lastName:string
            }) => {

                let accept = () => {
                    this.createAuth(req.requesting, req.firstName + req.lastName ? ' '+req.lastName : '', true).then(() => {
                        client.deleteData([req]).then(async ()=>{
                            await this.listAuths();
                            this.render();
                        });
                    });
                    
                }

                let reject = () => {
                    client.deleteData([req]).then(async ()=>{
                        await this.listAuths();
                        this.render();
                    });
                }

                this.userRequests.push(
                    <div>
                        User: {req.firstName} {req.lastName}<br/>
                        <button onClick={accept}>✔️</button>
                        <button onClick={reject}>❌</button>
                    </div>
                );
            });
        });
        
        this.render();
    }

    render() {
        return (
            <div id={this.unique}>
                <div>
                    Search Users<br/>
                    Name or Email:<input  id={this.unique+'query'} />
                    <button onClick={this.queryUsers} >Search</button>
                </div>
                <div>
                    Results:
                    <div>
                        <select id={this.unique+'select'}>
                            { this.queryResults.map(v => v) }
                        </select>
                        <button onClick={this.authFromSelect}>Add Peer</button>
                    </div>
                </div>
                <div>
                    Requests:
                    <div>
                        { this.userRequests.map(v => v) }
                    </div>
                </div>
                <div>
                    Outgoing:
                    <div>
                        { this.userRequests.map(v => v) }
                    </div>
                </div>
                <div>
                    Authorized:
                    <div>
                        { this.existingAuths.map(v => v) }
                    </div>
                </div>
            </div>
        )
    }

}