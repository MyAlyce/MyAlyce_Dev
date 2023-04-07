import { 
    Router, 
    HTTPbackend, 
    WSSbackend, 
    ServerProps, 
    ConnectionInfo, 
    SessionsService, 
    User, 
    SocketServerInfo 
} from 'graphscript-node'////'../../graphscript/index.node'//
import { 
    StructBackend 
} from 'graphscript-services-node'//'../../graphscript/src/extras/struct/Struct.backend'//

import { scriptBoilerPlate } from 'graphscript-node/src/services/http/boilerplate'
import { fitbitRoutes } from './fitbit';
import settings from './serverconfig'

import {config} from 'dotenv'
import fs from 'fs'

if(fs.existsSync('.env'))
    config(); //load the .env file


//NodeJS script

export let db;

//process.setMaxListeners(0);

const ContentServer = new Router({
    graph:{
        'wss':WSSbackend,
        'httpserver':{
            service:HTTPbackend,
            config:{
                'server1':{
                    protocol:settings.protocol,
                    host:settings.host,
                    port:settings.port,
                    pages:{
                        '/':{
                            template:scriptBoilerPlate('./index.js'), 
                            onrequest:function(self, node, request, response) {
                                // //e.g. CORS
                                // response.setHeader('Access-Control-Allow-Origin','*');
                                
                                // //e.g. SharedArrayBuffer
                                // response.setHeader('Cross-Origin-Opener-Policy','same-origin');
                                // response.setHeader('Cross-Origin-Embedder-Policy','require-corp');
                            }
                        }, //serve the built dist
                        '/*':{
                            redirect:'/'
                        },
                        '/home/*':{

                        },
                        'redir':{
                            redirect:'https://google.com'
                        },
                        'test':'<div>TEST</div>',
                        _all:{
                            inject:{ //page building
                                hotreload:`ws://${settings.host}:${settings.port}/hotreload` //this is a route that exists as dynamic content with input arguments, in this case it's a url, could pass objects etc in as arguments
                            }
                        }
                    },
                    onopen:(served)=>{

                        let hotreloadsocket = ContentServer.openConnection(
                            'wss',
                            {
                                server:served.server,
                                host:served.host,
                                port:settings.hotreload,
                                path:'hotreload',
                                onconnection:(ws)=>{
                                    ws.send('Hot reload port opened!');
                                }
                            }
                        )
                    }
                }
            }
        }
    }
});

const initDB = (router:Router) => {
    const { env } = process;
    let MONGODB_URI = `mongodb://${settings.host === 'localhost' ? '127.0.0.1' : settings.host}:${settings.localdbport}/${settings.localdb}`; //default localdb URI (if running);
    const mongoose = require('mongoose');

    //console.log(env);

    if(settings.mongodbmode === 'production' && typeof env.MONGODB !== 'undefined') {
        MONGODB_URI = env.MONGODB;
    } else if (settings.mongodbmode === 'dev' && typeof env.TESTDB !== 'undefined') {
        MONGODB_URI = env.TESTDB;
    } else if (settings.mongodbmode === 'dev' && typeof env.MONGODB !== 'undefined') {
        MONGODB_URI = env.MONGODB; //or just use this URI if the testdb uri is unavailable but this one is 
    }
    
    mongoose.connection.on('open', () => console.log(`connected to mongodb ${settings.mongodbmode} server`));
    
    console.log('Connecting to MongoDB URI:', MONGODB_URI);
    mongoose.connect(MONGODB_URI)
        .then(() => {
            db = new StructBackend({},{
                mode:'mongo', //'local'
                db: mongoose.connections[0].db, //set database
                users:router.users as any,
                useAuths:false //bypass our permissions system for users to be able to view each other
            } as any);

            router.addServices({
                db
            });

            console.log("MongoDB Connected!");
        })
        .catch((e:any) => {
            db = new StructBackend({},{
                mode:'local', //'local'
                users:router.users as any,
                useAuths:false //bypass our permissions system for users to be able to view each other
            } as any);

            router.addServices({
                db
            });

            console.log('\x1b[31m%s\x1b[0m', '\nERROR:', `Couldn't connect to mongodb ${settings.mongodbmode} server. Switching to in-memory db mode\n`);
            console.log('MESSAGE:', e.message);
            console.log('REASON:', e.reason);
            console.log('\nFULL ERROR:\n', e, '\n')
        });
}

//for message security:
//   add session key 

const DataServer = new Router({
    roots:{
        ...fitbitRoutes,
        userIsOnline:function(userId) {
            return DataServer.users[userId] !== undefined; //check who is online
        },
        getAllOnlineUsers:function(userIds?:string[]) { //dev
            if(userIds) {
                let res = [] as string[];
                for(const key in userIds) {
                    if(DataServer.users[key]) res.push(key);
                }
                return res;
            }
            return Object.keys(DataServer.users);
        }
    },
    graph:{
        'sessions':SessionsService,
        'wss':WSSbackend,
        'httpserver':{
            service:HTTPbackend,
            config:{
                'server2':{
                    protocol:settings.protocol,
                    certpath:fs.existsSync('fullchain.pem') ? fs.readFileSync('fullchain.pem').toString() : undefined,
                    keypath:fs.existsSync('privkey.pem') ? fs.readFileSync('privkey.pem').toString() : undefined,

                    host:settings.host,
                    port:settings.dataserverport,
                    pages:{
                        '/':'Data Server',
                        _all:{
                            inject:{ //page building
                                hotreload:`ws://${settings.host}:${settings.port}/hotreload` //this is a route that exists as dynamic content with input arguments, in this case it's a url, could pass objects etc in as arguments
                            }
                        }
                    },
                    onopen:(served)=>{

                        const wss = DataServer.openConnection(
                            'wss',
                            {
                                server:served.server,
                                host:served.host,
                                port:settings.datasocketport,
                                path:'wss',
                                onconnection:(ws: WebSocket,req,serverinfo,id)=>{
                                    //ws
                                    ws.send('{ "route":"log", "args":"Websocket connected"}');
                                    
                                    //debug
                                    //ws.addEventListener('message', (ev) => {console.log(ev.data);});
                                }
                            }
                        ).then((info:void | ConnectionInfo) => { if(info) {
                            //console.log(info.service.servers[info._id].wss)//'wss address:', (info.connection as SocketServerInfo).wss.address())
                        } })


                        initDB(DataServer);
                    
                        // let session = (DataServer.services.sessions as SessionsService).openSharedSession(
                        //     {
                        //         _id:'webrtcrooms',
                        //         settings:{
                        //             name:'webrtcrooms',
                        //             propnames:{
                        //                 rooms:true //if these props are updated on the user object we'll return them
                        //             }  
                        //         }
                        //     },
                        //     'admin'
                        // );
                        
                        // DataServer.run('sessionLoop');
                        
                        // DataServer.subscribe('addUser', (user:User) => {
                        //     // console.log('new user!', user._id);
                        //     // if(typeof user === 'object') {
                        //     //     let joined = (DataServer.services.sessions as SessionsService).joinSession('webrtcrooms', user._id);
                        //     //     if(joined) {
                        //     //         user.sendAll({route:'joinSession',args:[joined._id,user._id,joined]})
                        //     //     }
                        //     // }
                        // });
                        
                        
                    }
                } as ServerProps
            }
        }
    }
});