import { 
    Router, 
    HTTPbackend, 
    WSSbackend,
    ServerProps
} from 'graphscript-node'////'../../graphscript/index.node'//

import { scriptBoilerPlate } from 'graphscript-node/src/services/http/boilerplate'

import tcfg from '../tinybuild.config'
import settings from './serverconfig'

import {config} from 'dotenv'
import fs from 'fs'
import path from 'path'

if(fs.existsSync('.env'))
    config(); //load the .env file

//NodeJS script

//process.setMaxListeners(0);

import {Worker} from 'worker_threads'

const DataServer = new Worker(path.join(process.cwd(),'dataserver.js'));
//run the data server on a thread

DataServer.on('exit', (code) => {
    if (code !== 0)
      console.error(`Data Server stopped with exit code ${code}`);
});

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
                    certpath:settings.certpath,
                    keypath:settings.keypath,
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
                                hotreload:[`ws://${tcfg.server.host}:${tcfg.server.port}/hotreload`,tcfg.bundler.outfile.split('/').pop()+'.css'] //this is a route that exists as dynamic content with input arguments, in this case it's a url, could pass objects etc in as arguments
                            }
                        }
                    },
                    onopen:(served)=>{

                        if(settings.hotreload) 
                            ContentServer.openConnection(
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
                } as ServerProps
            }
        }
    }
});
