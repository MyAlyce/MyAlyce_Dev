import React, {Component} from 'react'
import { client } from '../../scripts/client';
import Button from 'react-bootstrap/Button';
import { AuthorizationStruct } from 'graphscript-services/struct/datastructures/types';
import Form from 'react-bootstrap/Form';

let personIcon = './assets/person.jpg';

//TODO:
// Change the queryResults select to a list like on the StreamSelect, probably make it its own components because it's so complicated Dx
export class UserAuths extends Component<{[key:string]:any}> {

    unique=`component${Math.floor(Math.random()*1000000000000000)}`;

    state = {
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
            let int = 0;
            client.queryUsers(query, 0, 0).then((res) => {
                res?.forEach((user) => {
                    this.queryResults.push(
                        <option key={int} value={user._id}>
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
                    int++;
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
                ).then(async ()=>{ 

                    if(!confirming) await client.addStruct(
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

        //my authorizations
        let auths = await client.getAuthorizations();
        auths?.forEach((a:AuthorizationStruct) => {
            this.existingAuths.push(
                <tr key={a._id} id={this.unique+a._id}>
                    <td>Permissions: ${Object.keys(a.authorizations).map((key)=>{
                        return `${key}:${(a.authorizations as any)[key]}`; //return true authorizations
                    })}</td>
                    <td>Authorized: ${a.authorizedName}</td>
                    <td>Authorizer: ${a.authorizerName}</td>
                    <td>Status: ${a.status}</td>
                    <td><button onClick={()=>{ 
                        client.deleteAuthorization(a._id,()=>{ 
                            this.listAuths();
                        }); 
                    }}>❌</button></td>
                </tr>
            )
        }); //get own auths

        let getAuthsFromRequest = (req) => {
            return auths ? auths.filter((a) => {
                if(
                    (a.authorizedId === req.requesting && a.authorizerId === req.receiving) ||
                    (a.authorizerId === req.requesting && a.authorizedId === req.receiving)
                ) {
                    return true;
                }
            }) : []; 
        }

        //my requests
        let authRequests = await client.getData('authRequest', undefined, {requesting: client.currentUser._id});
        if(authRequests) await Promise.all(authRequests.map(async (req:{
            requesting:string, //them
            receiving:string //me
            receivingName:string,
            users:string, //this will cause this user to receive a notification
            authorizations:{ 'peer':true },
            firstName:string,
            lastName:string,
            _id:string
        }) => {

            if(auths.find((a) => {
                
                if(a.status === 'OKAY' && a.authorizerId === req.requesting && a.authorizedId === req.receiving) {
                    return true;
                }
                
            })) {
                await client.deleteData([req, ...getAuthsFromRequest(req)]);
            }
            else {

                let cancelRequest = async () => {
                    await client.deleteData([req, ...getAuthsFromRequest(req)]);
                    this.listAuths();
                }
    
                this.sentRequests.push(
                    <div key={req._id}>
                        To: {req.receivingName}
                        <Button onClick={cancelRequest}>❌</Button>
                    </div>
                );
            }

        }));

        //other people's requests
        let otherAuthRequests = await client.getData('authRequest', undefined, {receiving: client.currentUser._id})
        if(otherAuthRequests) await Promise.all(otherAuthRequests.map( async (req:{
            requesting:string, //them
            receiving:string //me
            receivingName:string,
            users:string, //this will cause this user to receive a notification
            authorizations:{ 'peer':true },
            firstName:string,
            lastName:string,
            _id:string
        }) => {

            if(auths.find((a) => {
                if(a.status === 'OKAY' && a.authorizerId === req.receiving && a.authorizedId === req.requesting) {
                    return true;
                }
                
            })) {
                await client.deleteData([req, ...getAuthsFromRequest(req)]);
                this.setState({})
            }
            else {

                let cancelRequest = async () => {
                    await client.deleteData([req, ...getAuthsFromRequest(req)]);
                    this.listAuths();
                }
    
                this.sentRequests.push(
                    <div key={req._id}>
                        To: {req.receivingName}
                        <Button onClick={cancelRequest}>❌</Button>
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
                client.deleteData([req, ...getAuthsFromRequest(req)]).then(async ()=>{
                    await this.listAuths();
                    this.setState({});
                });
            }

            this.userRequests.push(
                <div key={req._id}>
                    User: {req.firstName} {req.lastName}<br/>
                    <Button onClick={accept}>✔️</Button>
                    <Button onClick={reject}>❌</Button>
                </div>
            );
        }));
        
        this.setState({});
    }


    render() {

        return (
            <div id={this.unique}>
                <h2>User Authorizations</h2>

                <div>
                    <h3>Search Users</h3>
                    <div>
                    <Form>
                        <Form.Group className="mb-3" controlId="searchInput">
                            <Form.Label>Name or Email</Form.Label>
                            <Form.Control 
                                id={this.unique+'query'} 
                                type="text" 
                                defaultValue=""
                                ref={this.ref as any}
                                placeholder="Enter Name or Email" 
                            />
                        </Form.Group>
                        <Button onClick={this.queryUsers} >Search</Button>
                    </Form>
                    </div>

                    <h4>Results</h4>
                    <div>
                        <Form>
                            <Form.Group className="mb-3" controlId="searchResult">
                                <Form.Select 
                                    id={this.unique+'select'} 
                                    onChange={()=>{}} 
                                >
                                    { this.queryResults.map(v => {
                                            console.log(v);
                                            return v;
                                        }) }
                                </Form.Select>
                            </Form.Group>
                            <Button onClick={this.authFromSelect}>Add Peer</Button>
                        </Form>
                    </div>
                </div>

                <div>
                    <h3>Your Authorizations</h3>
                    <div>
                        <h4>Requests</h4>
                        <div>
                            {  this.userRequests  }
                        </div>
                    </div>
                    <div>
                        <h4>Outgoing</h4>
                        <div>
                            {  this.sentRequests  }
                        </div>
                    </div>
                    <div>
                        <h4>Authorized</h4>
                        <table>
                            <tbody>
                                {  this.existingAuths  }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }

}