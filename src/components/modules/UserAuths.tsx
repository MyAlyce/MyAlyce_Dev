import React, {Component} from 'react'
import { client, defaultProfilePic, usersocket } from '../../scripts/client';
import Button from 'react-bootstrap/Button';
import { AuthorizationStruct } from 'graphscript-services/struct/datastructures/types';
import { UserSearch } from './UserSearch';
import ListGroup from 'react-bootstrap/ListGroup';
import * as Icon from 'react-feather';
import { Card } from 'react-bootstrap';
import { Avatar } from '../ui/Avatar';

let personIcon = './assets/person.jpg';

//TODO:
// Change the queryResults select to a list like on the StreamSelect, probably make it its own components because it's so complicated Dx
export class UserAuths extends Component<{[key:string]:any}> {

    unique=`component${Math.floor(Math.random()*1000000000000000)}`;

    state = {
        authRequests:undefined,
        searching:false
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
            client.queryUsers(
                query, 
                0, 
                0 //eventually add pages for large results
            ).then((res) => {
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

    authFromSelect = (ev:{userId:string,name:string}) => {
        this.createAuth(
            ev.userId, 
            ev.name
        );
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
                            requestingPictureUrl:client.currentUser.pictureUrl,
                            receiving:userId,
                            receivingName:name,
                            users:[userId,client.currentUser._id],
                            firstName:client.currentUser.firstName,
                            lastName:client.currentUser.lastName,
                            authorizations:{ 'peer':true }
                        }
                    );

                    await this.listAuths();
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
        let auths = client.getLocalData('authorization', {authorizedId:client.currentUser._id}); //await client.getAuthorizations();
        let secondaryAuths = client.getLocalData('authorization', {authorizerId:client.currentUser._id}); //await client.getAuthorizations();

        let userIds = auths.map((v) => {return v.authorizerId});

        let info = await client.getUsers(userIds, true); //get profile pics and stuff

        let onlineUsers = await usersocket.run('usersAreOnline',[userIds]);

        auths?.sort((a, b) => {
            if (a.status === 'OKAY' && b.status !== 'OKAY') {
              return -1;
            } else if (b.status === 'OKAY' && a.status !== 'OKAY') {
              return 1;
            } else {
              return 0;
            }
        });

        auths?.forEach((a:AuthorizationStruct) => {

            let userIsOnline;

            let userInfo = info.find((v,i) => {
                if(v._id === a.authorizerId) {
                    userIsOnline = onlineUsers[i];
                    return true;
                }
            });

            this.existingAuths.push( //lumping both auths into one for a more typical "friend" connection, need to toggle permissions tho
            <ListGroup.Item key={a._id} id={this.unique+a._id}>
                {/* <td>Permissions: ${Object.keys(a.authorizations).map((key)=>{
                    return `${key}:${(a.authorizations as any)[key]}`; //return true authorizations
                })}</td> */}
                <div className="float-start">
                    <Avatar
                        pictureUrl={userInfo?.pictureUrl ? userInfo.pictureUrl : defaultProfilePic}
                        onlineStatus={a.status === 'OKAY' ? userIsOnline : undefined}
                    /> {a.authorizerName} </div>
                <div className="float-end"><Button variant="outline-success" size="sm" onClick={async ()=>{ 
                    await client.deleteAuthorization(a._id); 
                    let secondaryAuth = secondaryAuths.find((a2) => {if(a2.authorizedId === a.authorizerId) return true; });
                    if(secondaryAuth) await client.deleteAuthorization(secondaryAuth._id);
                    setTimeout(()=>{this.listAuths()},100); //give time for server to delete local data (hacky)
                }}>Remove</Button>{a.status === 'OKAY' ? null : <div>{a.status}</div>}</div>
            </ListGroup.Item>
            );
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
                if(a.status === 'OKAY' && ((a.authorizerId === req.receiving && a.authorizedId === req.requesting) || (a.authorizerId === req.requesting && a.authorizedId === req.receiving))) {
                    return true;
                }
            })) {
                await client.deleteData([req]);
            }
            else {

                let userInfo = info.find((v) => {
                    if(v._id === req.receiving) return true;
                });

                let cancelRequest = async () => {
                    await client.deleteData([req, ...getAuthsFromRequest(req)]);
                    this.listAuths();
                }
    
                this.sentRequests.push(
                    <div key={req._id}>
                        To:  <div className="float-start"><Avatar pictureUrl={userInfo?.pictureUrl ? userInfo.pictureUrl : defaultProfilePic}/></div> {req.receivingName}
                        <Button onClick={cancelRequest}>❌</Button>
                    </div>
                );
            }

        }));

        //other people's requests
        let otherAuthRequests = await client.getData('authRequest', undefined, {receiving: client.currentUser._id});
        if(otherAuthRequests) await Promise.all(otherAuthRequests.map( async (req:{
            requesting:string, //them
            requestingPictureUrl?:string,
            receiving:string //me
            receivingName:string,
            users:string, //this will cause this user to receive a notification
            authorizations:{ 'peer':true },
            firstName:string,
            lastName:string,
            _id:string
        }) => {
            
            if(auths.find((a) => {
                if(a.status === 'OKAY' && ((a.authorizerId === req.receiving && a.authorizedId === req.requesting) || (a.authorizerId === req.requesting && a.authorizedId === req.receiving))) {
                    return true;
                }
                
            })) {
                await client.deleteData([req]);
            }
            else {

                let userIsOnline;

                let userInfo = info.find((v,i) => {
                    if(v._id === req.requesting) {
                        userIsOnline = onlineUsers[i];
                        return true;
                    }
                });

                let accept = () => {
                    this.createAuth(req.requesting, req.firstName + req.lastName ? ' '+req.lastName : '', true).then(() => {
                        client.deleteData([req]).then(()=>{
                           this.listAuths();
                        });
                    });
                    
                }

                let reject = () => {
                    client.deleteData([req, ...getAuthsFromRequest(req)]).then(()=>{
                        this.listAuths();
                    });
                }

                this.userRequests.push(
                    <div key={req._id}>
                        From: <div className="float-start"><Avatar pictureUrl={req.requestingPictureUrl ? req.requestingPictureUrl : defaultProfilePic} onlineStatus={userIsOnline} /></div> {req.firstName} {req.lastName}<br/>
                        <Button onClick={accept}>✔️</Button>
                        <Button onClick={reject}>❌</Button>
                    </div>
                );
            }

        }));
        
        this.setState({});
    }


    render() {

        return (
            <div id={this.unique}>
                <Card>
                <Button variant="secondary" size="sm"onClick={()=>{ this.setState({searching:!this.state.searching})}}><Icon.Search size={20} className="float-start"></Icon.Search><div className="float-start">&nbsp;Search</div></Button>
                </Card>
                { this.state.searching ? 
                    <>
                        <UserSearch 
                            onClick={this.authFromSelect}
                        />
                    </> : null
                }
                <div>
                    <h3>Connections</h3>
                    {this.userRequests?.length > 0 ? 
                       (
                        <div>
                            <h4>Requests</h4>
                            <div>
                                {  this.userRequests  }
                            </div>
                        </div>
                        ) : null
                    }
                    { this.sentRequests?.length > 0 ? 
                        (
                            <div>
                                <h4>Outgoing</h4>
                                <div>
                                    {  this.sentRequests  }
                                </div>
                            </div>
                        ) : null
                    }
                    <div>
                        <h4>Authorized</h4>
                        <ListGroup>
                        {  this.existingAuths  }
                        </ListGroup>
                    </div>
                </div>
            </div>
        )
    }

}