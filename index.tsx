import React from 'react'
//@ts-ignore
import {createRoot} from 'react-dom/client'
import { App } from './src/app'

import './src/init' //run init sequence

const useStyles = true;

//esbuild compiles these
import './src/components/lib/src/index.css'
import './src/styles/index.scss'
import './src/styles/burger.css'
import './src/styles/styles.css'

if(useStyles) {
  document.head.insertAdjacentHTML('beforeend','<meta name="viewport" content="width=device-width, initial-scale=1" />');
  document.head.insertAdjacentHTML('beforeend', '<link rel="preconnect" href="https://rsms.me/"><link rel="stylesheet" href="https://rsms.me/inter/inter.css">');
  document.head.insertAdjacentHTML('beforeend','<link href="./styles/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">');
  document.head.insertAdjacentHTML('beforeend',`<link rel="stylesheet" href="./index.css" type="text/css" />`
  );
}

let container = document.createElement('div');
document.body.appendChild(container);

let root = createRoot(container);

root.render(
    <App/>
);
