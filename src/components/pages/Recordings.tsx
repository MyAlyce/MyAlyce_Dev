import React from 'react'
import { sComponent } from '../state.component'
import {client, state, webrtc} from '../../scripts/client'

import { BFSRoutes, csvRoutes } from 'graphscript-services.storage'//'../../../../graphscript/src/extras/index.storage.services'//

import { driveInstance } from '../../scripts/client';
import { recordCSV, stopRecording } from '../../scripts/datacsv';
import { StreamSelect } from '../modules/StreamSelect';
import Button from 'react-bootstrap/Button';
import { NoteTaking } from '../modules/NoteTaking';
import { RTCCallInfo } from '../../scripts/webrtc';

import gsworker from '../../scripts/device.worker'
import { WorkerInfo } from 'graphscript';
import { workers } from 'device-decoder';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as Icon from 'react-feather'
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

//add google drive backup/sync since we're using google accounts

export class Recordings extends sComponent {

    state = {
        isRecording:false,
        recordings:undefined,
        activeStream:undefined,
        folders:undefined as any
    }

    dir?:string    
    csvworker:WorkerInfo;
    toggled=[] as any[];

    constructor(props:{dir?:string}) {
        super(props);

        this.dir = props.dir;
    }

    componentDidMount(): void {
        this.csvworker = workers.addWorker({url:gsworker});
        this.csvworker.run('checkFolderList', [client.currentUser.firstName+client.currentUser.lastName+'/folderList', this.dir]).then(()=> {        
            this.parseFolderList();
        });
        this.listRecordings();
    }

    componentWillUnmount(): void {
        this.csvworker?.terminate();
    }

    async parseFolderList() {

        csvRoutes.readCSVChunkFromDB(
            client.currentUser.firstName+client.currentUser.lastName + '/folderList'
        ).then((data:any) => {
            this.setState({folders:data.folder});
        });
    }

    //list from db
    async listRecordings() {
        let recordings = [] as any[];
        //get saved files in indexeddb
        //iterate and push divs with download & delete & backup
        //list backed up nonlocal files too? from gdrive

        let dir = this.dir ? this.dir : this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName +(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName;
        let filelist = await BFSRoutes.listFiles(dir); //list for a particular user
        //getfilelist

        
        filelist.forEach((file) => {

            if(!file.includes('folderList')) {

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
                    driveInstance?.backupToDrive(dir+'/'+file);
                }
    
                recordings.push (
                    <div key={file}>
                        <Container fluid>
                            <Row className='recordings'>
                                <Col xs lg="2" className='over'>{file}</Col>
                                <Col className="d-grid gap-2"><Button variant='secondary' onClick={download}>Download</Button></Col>
                                <Col className="d-grid gap-2"><Button variant='danger' onClick={deleteFile}>Delete</Button></Col>
                                <Col className="d-grid gap-2"><Button variant='success' onClick={backup}>To Drive</Button></Col>
                            </Row>
                            <hr></hr>
                        </Container>
                    </div>
                )
            } 
        });

        this.setState({recordings});

        return recordings;
    }

    record(streamId?:string, sensors?:('emg'|'ppg'|'breath'|'hr'|'imu'|'env'|'ecg')[], subTitle?:string, dir?:string) {
        recordCSV(streamId, sensors, subTitle, dir);
    }

    async stopRecording(streamId?:string, dir?:string) {
        await stopRecording(streamId, dir, client.currentUser.firstName+client.currentUser.lastName); //folder list will be associated with current user so they will only see indexeddb folders for users they are associated with
        this.listRecordings();
    }

    render() {

        let dir =  this.dir ? this.dir : this.state.activeStream ? (webrtc.rtc[this.state.activeStream] as RTCCallInfo).firstName +(webrtc.rtc[this.state.activeStream] as RTCCallInfo).lastName : client.currentUser.firstName + client.currentUser.lastName;

        let subscribable = ['emg','ppg','breath','hr','imu','env','ecg'];
        this.toggled.length = 0;

        return (
            <div className='container-fluid'>
                <h1>Recording Manager</h1>
                <NoteTaking 
                    streamId={this.state.activeStream} 
                    filename={this.state.activeStream ? this.state.activeStream+'.csv' : 'Notes.csv'} 
                    dir={ dir }/>
                {this.state.isRecording ? 
                    <button onClick={()=>{stopRecording(this.state.activeStream, dir, client.currentUser.firstName+client.currentUser.lastName)}}> </button> : 
                    <div>
                        <button onClick={()=>{
                            this.record(this.state.activeStream,this.toggled,dir,dir
                        )}}>
                            Record
                        </button>
                        <ToggleButtonGroup type="checkbox">
                        {
                            subscribable.map((v) => {
                                this.toggled.push(v);
                                return <ToggleButton
                                    key={v}
                                    value={v}
                                    onChange={(ev:any)=>{ 
                                        let idx = this.toggled.indexOf(v);
                                        if(idx < 0) {
                                            ev.currentTarget.checked = true;
                                            this.toggled.push(v);
                                        }
                                        if(idx > -1) {
                                            ev.currentTarget.checked = false;
                                            this.toggled.splice(idx, 1);
                                        }
                                    }}
                                >{v.toUpperCase()}</ToggleButton>
                            })
                        }
                        </ToggleButtonGroup>

                    </div> 
                    }
                Select Folder: 
                <select onChange={(ev)=>{ this.dir = ev.target.value; this.listRecordings(); }}>
                    { this.state.folders ? this.state.folders.map((v) => {
                        return (<option value={v} key={v}>{v}</option>)
                    }) : null }
                </select>
                <h2>Recordings</h2>
                <div>
                    { this.state.recordings ? this.state.recordings : "" }
                </div>
            </div>
        )

    }

}
