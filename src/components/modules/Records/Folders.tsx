import React from 'react'

import { Button } from 'react-bootstrap';
import { client, setCamelCase, splitCamelCase, state } from '../../../scripts/client';
import { checkFolderList, parseFolderList } from '../../../scripts/folders';
import { sComponent } from '../../state.component';


export class Folders extends sComponent {

    unique=`folder${Math.floor(Math.random()*10000000000000)}`;

    folders=[] as string[]

    state={
        selectedFolder:""
    }


    constructor(props:{folder:string, onSelected:(folder:string)=>void}) {
        super(props);
    }

    componentDidMount() {
        this.parseFolderList();
    }

    async parseFolderList() {
        parseFolderList(client.currentUser.firstName + client.currentUser.lastName).then((folders) => {
            this.folders = folders;
            this.setState({});
        });
    }

    render() {
        return (<>
            <select defaultValue={state.data.selectedFolder} onChange={(ev)=>{
                if(this.props.onSelected) {
                    this.props.onSelected(ev.target.value);
                    this.setState({selectedFolder:ev.target.value});
                }
            }}>{...this.folders.map((v) => {
                return <option value={v}>{splitCamelCase(v)}</option>;
            })}</select>
            <input id={this.unique+'input'} type="text"></input>
            <Button onClick={()=>{
                let newFolder = (document.getElementById(this.unique+'input') as any).value;
                if(newFolder) {
                    checkFolderList(
                        client.currentUser.firstName+client.currentUser.lastName+'/folderList', 
                        setCamelCase(newFolder)
                    ).then(() => {
                        this.parseFolderList();
                    });
                }
            }}>Add Folder</Button>
        </>);
    }
}