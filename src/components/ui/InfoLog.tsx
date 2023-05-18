import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as Icon from 'react-feather';
import { Notes } from './Notes.tsx';


export function InfoLog (){
    
    return (
        <>
        <h3>Info Logging</h3> 
        <Container>
            <Row className='addspace'>
                <Col className="d-grid gap-2"><Notes /></Col>
                <Col className="d-grid gap-2"><Button variant="secondary"><Icon.Smile className="align-text-bottom" size={20}></Icon.Smile>&nbsp;Mood</Button></Col>
                <Col className="d-grid gap-2"><Button variant="success"><Icon.Activity className="align-text-bottom" size={20}></Icon.Activity>&nbsp;Activities</Button></Col>
            </Row>
            <Row className='addspace'>
                <Col className="d-grid gap-2"><Button variant="primary"><Icon.Paperclip className="align-text-bottom" size={20}></Icon.Paperclip>&nbsp;Meds</Button></Col>
                <Col className="d-grid gap-2"><Button variant="dark"><Icon.EyeOff className="align-text-bottom" size={20}></Icon.EyeOff>&nbsp;Sleep</Button></Col>
                <Col className="d-grid gap-2"><Button variant="accent1"><Icon.Anchor className="align-text-bottom" size={20}></Icon.Anchor>&nbsp;Other</Button></Col>
            </Row>
        </Container>
        </>
    )
}