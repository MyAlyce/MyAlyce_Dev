export default server = {  //node server settings, set false to skip server step or add serve:true to config object to only serve (alt methods)
    debug: false,
    protocol: "http",  //'http' or 'https'. HTTPS required for Nodejs <---> Python sockets. If using http, set production to False in python/server.py as well
    host: "localhost", //'localhost' or '127.0.0.1' etc.
    port: 8081, //e.g. port 80, 443, 8000\
    
    dataserverport:8083,
    datasocketport:8084,
    
    mongodbmode: "dev", //local, dev, production, or undefined/false/null/0 for no mongoose
    localdbport:27017, //mongodb localhost port
    localdb:'test', //a mongodb database added onto the end of our localdb uri e.g. localhost/test

    startpage: "index.html", //home page
    socket_protocol: "ws", //frontend socket protocol, wss for served, ws for localhost
    hotreload: 7000,  //hotreload websocket server port. Set to let tinybuild handle this part for now and redirect to this server
    //watch: ['../'], //watch additional directories other than the current working directory
    pwa: "dist/service-worker.js",  //pwa mode? Injects service worker registry code in (see pwa README.md)
    python: false,//7000,  //quart server port (configured via the python server script file still)
    python_node: 7001, //websocket relay port (relays messages to client from nodejs that were sent to it by python)
    errpage: "node_modules/tinybuild/tinybuild/node_server/other/404.html",  //default error page, etc.
    certpath: "cert.pem", //if using https, this is required. See cert.pfx.md for instructions
    keypath: "key.pem" //if using https, this is required. See cert.pfx.md for instructions
}