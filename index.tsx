import React from 'react'
//@ts-ignore
import {createRoot} from 'react-dom/client'
import { App } from './src/app'

import './src/init' //run init sequence

const useStyles = true;

//esbuild compiles these
import 'my-alyce-component-lib/dist/index.css'
import './src/styles/styles.css'
import './src/styles/index.scss'
import './src/styles/burger.css'

if(useStyles) {
  document.head.insertAdjacentHTML('beforeend',
  `<link rel="stylesheet" href="./index.css" type="text/css" />`
  );
}

let container = document.createElement('div');
document.body.appendChild(container);

let root = createRoot(container);

root.render(
    <App/>
);
