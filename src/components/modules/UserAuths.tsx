import React, {useRef} from 'react'
import { sComponent } from '../state.component'
import { client } from '../../scripts/client';
import { Avatar, Button } from '../../components/lib/src/index';
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

    ref;
    constructor(props) {
        super(props);

        this.listAuths();
        this.ref = React.createRef();
    }

    queryUsers = () => {
        let query = (document.getElementById(this.unique + 'query') as HTMLInputElement).value;
        this.queryResults = [];
        if(query) {
            client.queryUsers(query, 0, 0).then((res) => {
                res?.forEach((user) => {
                    this.queryResults.push(
                        <option key={user._id} value={user._id}>
                            {/* <Avatar
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
                            /> */}{user.firstName} {user.lastName} 
                        </option>
                    );
                });
                this.setState({});
            });
        }
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

        let auths = await client.getAuthorizations();
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
        }); //get own auths

        //my requests
        let authRequests = await client.getData('authRequest', undefined, {requesting: client.currentUser._id});
        authRequests?.forEach((req:{
            requesting:string, //them
            receiving:string //me
            receivingName:string,
            users:string, //this will cause this user to receive a notification
            authorizations:{ 'peer':true },
            firstName:string,
            lastName:string
        }) => {

            if(auths.find((a) => {
                
                if(a.status === 'OKAY' && a.authorizerId === req.requesting && a.authorizedId === req.receiving) {
                    return true;
                }
                
            })) {
                client.deleteData([req]);
            }
            else {

                let deleteRequest = () => {
                    client.deleteData([req]);
                }
    
                this.sentRequests.push(
                    <div>
                        To: {req.receivingName}
                        <Button onClick={deleteRequest}>❌</Button>
                    </div>
                );
            }

        });

        //other people's requests
        let otherAuthRequests = await client.getData('authRequest', undefined, {receiving: client.currentUser._id})
        otherAuthRequests?.forEach((req:{
            requesting:string, //them
            receiving:string //me
            receivingName:string,
            users:string, //this will cause this user to receive a notification
            authorizations:{ 'peer':true },
            firstName:string,
            lastName:string
        }) => {

            if(auths.find((a) => {
                if(a.status === 'OKAY' && a.authorizerId === req.receiving && a.authorizedId === req.requesting) {
                    return true;
                }
                
            })) {
                client.deleteData([req]);
            }
            else {

                let deleteRequest = () => {
                    client.deleteData([req]);
                }
    
                this.sentRequests.push(
                    <div>
                        To: {req.receivingName}
                        <Button onClick={deleteRequest}>❌</Button>
                    </div>
                );
            }


            let accept = () => {
                this.createAuth(req.requesting, req.firstName + req.lastName ? ' '+req.lastName : '', true).then(() => {
                    client.deleteData([req]).then(async ()=>{
                        await this.listAuths();
                        this.setState({});
                    });
                });
                
            }

            let reject = () => {
                client.deleteData([req]).then(async ()=>{
                    await this.listAuths();
                    this.setState({});
                });
            }

            this.userRequests.push(
                <div>
                    User: {req.firstName} {req.lastName}<br/>
                    <Button onClick={accept}>✔️</Button>
                    <Button onClick={reject}>❌</Button>
                </div>
            );
        });
        
        this.setState({});
    }


    render() {

        return (
            <div id={this.unique}>
                <h2>User Authorizations</h2>

                <div>
                    <h3>Search Users</h3>
                    <div>
                        <label>Name or Email</label>
                        <input 
                            id={this.unique+'query'} 
                            type="text" 
                            defaultValue=""
                            ref={this.ref as any}
                        />
                        <Button onClick={this.queryUsers} >Search</Button>
                    </div>

                    <h4>Results</h4>
                    <div>
                        <select id={this.unique+'select'} onChange={()=>{}}>
                            { this.queryResults.map(v => {
                                console.log(v);
                                return v;
                            }) }
                        </select>
                        <Button onClick={this.authFromSelect}>Add Peer</Button>
                    </div>
                </div>

                <div>
                    <h3>Your Authorizations</h3>
                    <div>
                        <h4>Requests</h4>
                        <div>
                            {  this.userRequests }
                        </div>
                    </div>
                    <div>
                        <h4>Outgoing</h4>
                        <div>
                            {  this.sentRequests }
                        </div>
                    </div>
                    <div>
                        <h4>Authorized</h4>
                        <div>
                            {  this.existingAuths }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}