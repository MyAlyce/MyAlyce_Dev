import { 
    Router, 
    HTTPbackend, 
    WSSbackend,
    ServerProps,
    SocketServerProps,
    SocketServerInfo
} from 'graphscript-node'////'../../graphscript/index.node'//

import { scriptBoilerPlate } from 'graphscript-node/src/services/http/boilerplate'

import tcfg from '../tinybuild.config'
import settings from './serverconfig'

import {config} from 'dotenv'
import fs from 'fs'
import path from 'path'

import httpProxy from 'http-proxy'

let proxy;

if(settings.protocol === 'https') {
 proxy = httpProxy.createProxyServer({
    ssl:{
        key:fs.readFileSync(settings.keypath),
        cert:fs.readFileSync(settings.certpath)
    },
    ws:true
 });
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

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
                                //console.log('request')
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
                                hotreload:[
                                    `${tcfg.server.protocol === 'https' ? 'wss' : 'ws'}://${tcfg.server.protocol === 'https' ? tcfg.server.domain : 
                                        tcfg.server.host}${tcfg.server.protocol === 'https' ? `` : `:${tcfg.server.port}` }/hotreload`, 
                                    tcfg.bundler.outfile.split('/').pop()+'.css'
                                ], //this is a route that exists as dynamic content with input arguments, in this case it's a url, could pass objects etc in as arguments
                                //pwa:undefined as any
                            }
                        }
                    },
                    onopen:(served)=>{

                        if(settings.hotreload) 
                            ContentServer.openConnection(
                            'wss',
                                {
                                    server:served.server,
                                    host:settings.protocol === 'https' ? settings.domain : settings.host,
                                    port:settings.hotreload,
                                    path:'hotreload',
                                    onconnection:(ws)=>{
                                        ws.send('Hot reload port opened!');
                                    }
                                } as SocketServerProps
                            )
                    },
                    onupgrade:(request, socket, head, served) => {
                        if(settings.protocol === 'https' && request.url.startsWith('/wss')) {
                            proxy.ws(request, socket, head, {target:'http://' + settings.domain + ':' + settings.datasocketport })
                        }
                    }
                } as ServerProps
            }
        }
    }
});
