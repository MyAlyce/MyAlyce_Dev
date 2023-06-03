import React from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import * as Icon from 'react-feather'


export function InfoLogPlayer (){
    
    return (
        <>
        <h3>Record Stream</h3> 
        <Container>
            <Row className='addspace player'>
                <Col className="d-grid gap-2"><Button variant="secondary" size="sm"><Icon.Play className="align-text-bottom" size={20}></Icon.Play>&nbsp;Play</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-light" size="sm"><Icon.Pause className="align-text-bottom" size={20}></Icon.Pause>&nbsp;Pause</Button></Col>
                <Col className="d-grid gap-2"><Button variant="outline-accent1" size="sm"><Icon.Circle className="align-text-bottom" size={20}></Icon.Circle>&nbsp;Record</Button></Col>
            </Row>
        </Container>
        </>
    )
}