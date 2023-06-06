import React, { Component } from "react";
import { Widget } from "../../widgets/Widget";
import { Button, Col, Row } from "react-bootstrap";
import { BFSRoutes, csvRoutes } from "graphscript-services.storage";
import { client, driveInstance, splitCamelCase, webrtc } from "../../../scripts/client";
import { RTCCallInfo } from "../../../scripts/webrtc";

import { workers } from 'device-decoder';
import gsworker from '../../../scripts/device.worker'
import { WorkerInfo } from 'graphscript';

import * as Icon from 'react-feather'

let GDriveIcon = "./assets/GDrive.svg";

let selectedFolder = '';

export class RecordingsList extends Component<{dir?:string, streamId?:string}> {

    state = {
        folders:undefined as any,
        recordings:undefined
    }

    dir?:string;
    csvworker:WorkerInfo;
    streamId?:string;

    constructor(props:{dir?:string, streamId?:string}) {
        super(props);


        this.dir = props.dir;
        if(this.dir) selectedFolder = this.dir;
        this.streamId = props?.streamId;
    }

    async parseFolderList() {

        csvRoutes.readCSVChunkFromDB(
            client.currentUser.firstName+client.currentUser.lastName + '/folderList'
        ).then((data:any) => {
            this.setState({folders:data.folder});
            this.listRecordings();
        });
    }

    componentDidMount(): void {

        this.dir = selectedFolder;

        this.csvworker = workers.addWorker({url:gsworker});
        if(client.currentUser) this.csvworker.run('checkFolderList', [client.currentUser.firstName+client.currentUser.lastName+'/folderList', this.dir]).then(()=> {        
            this.parseFolderList();
        });
    }

    componentWillUnmount(): void {
        this.csvworker?.terminate();
    }
    //list from db
    async listRecordings() {
        let recordings = [] as any[];
        //get saved files in indexeddb
        //iterate and push divs with download & delete & backup
        //list backed up nonlocal files too? from gdrive

        let dir = this.dir ? this.dir : 
            this.streamId ? (webrtc.rtc[this.streamId] as RTCCallInfo).firstName +(webrtc.rtc[this.streamId] as RTCCallInfo).lastName : 
            client.currentUser.firstName + client.currentUser.lastName;
        
        let filelist = await BFSRoutes.listFiles(dir); //list for a particular user
        //getfilelist
        if(!selectedFolder) selectedFolder = dir;

        filelist.forEach((file) => {

            if(!file.includes('folderList') && !file.includes('state')) {

                let download = async () => {
                    csvRoutes.writeToCSVFromDB(dir+'/'+file, 10); //download files in chunks (in MB). !0MB limit recommended, it will number each chunk for huge files
                }
    
                let deleteFile = () => {
                    BFSRoutes.deleteFile(dir+'/'+file).then(() => {
                        this.listRecordings();
                    });
                }
    
                let backup = () => {
                    //google drive backup
                    driveInstance?.backupToDrive(file, dir);
                }
    
                recordings.push (
                    <div key={file}>
                        <Row className='recordings'>
                            <Col xs lg="2" className='over'>{file}</Col>
                            <Col className="d-grid gap-2"><Button variant='secondary' onClick={download}><Icon.Download/></Button></Col>
                            <Col className="d-grid gap-2"><Button variant='danger' onClick={deleteFile}><Icon.X/></Button></Col>
                            <Col className="d-grid gap-2"><Button variant='caution' onClick={backup}><img src={GDriveIcon} height="50px" width="50px"></img ></Button></Col>
                        </Row>
                    </div>
                )
            } 
        });

        this.setState({recordings});

        return recordings;
    }


    render() {

        return (
            <Widget 
                header={( <b>Recordings</b> )}
                content={
                    <>
                    <label>Select Folder:</label>&nbsp;
                    <select value={selectedFolder} onChange={(ev)=>{ 
                        this.dir = ev.target.value; selectedFolder=ev.target.value; this.listRecordings(); 
                        }}>
                        { this.state.folders ? this.state.folders.map((v) => {
                            return (<option value={v} key={v}>{splitCamelCase(v)}</option>)
                        }) : null }
                    </select>
                    <hr />
                    <div>
                        {this.state.recordings ? this.state.recordings : ""}
                    </div>
                </>
                }
            />
        );
    }
}