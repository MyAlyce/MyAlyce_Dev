import React from 'react'
//@ts-ignore
import {createRoot} from 'react-dom/client'
import { App } from './src/app'

import './src/init' //run init sequence

const useStyles = true;

//esbuild compiles these into index.css
import './src/components/lib/src/index.css'
import './src/styles/index.scss'
import './src/styles/burger.css'
//import './src/styles/inter.css'
import './src/styles/styles.css'
//import './src/styles/bootstrap.min.css'

if(useStyles) {
  document.head.insertAdjacentHTML('beforeend','<meta name="viewport" content="width=device-width, initial-scale=1" />');
  document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="./index.css" type="text/css" />`);
}

let container = document.createElement('div');
document.body.appendChild(container);

let root = createRoot(container);

root.render(
    <App/>
);
