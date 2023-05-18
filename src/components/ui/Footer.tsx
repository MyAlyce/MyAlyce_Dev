import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import * as Icon from 'react-feather';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

export function Footer (){
    return (
        <>
            <Navbar bg="dark" fixed="bottom">
                <Container>
                    <Button variant="primary" size="sm"><Icon.Home className="align-text-bottom" size={16}></Icon.Home>&nbsp;Home</Button>{' '}
                    <Button variant="secondary" size="sm"><Icon.Phone className="align-text-bottom" size={16}></Icon.Phone>&nbsp;Video Call</Button>{' '}
                    <Button variant="success" size="sm"><Icon.Activity className="align-text-bottom" size={16}></Icon.Activity>&nbsp;Log Data</Button>{' '}
                    <Button variant="accent1" size="sm"><Icon.BookOpen className="align-text-bottom" size={16}></Icon.BookOpen>&nbsp;History</Button>{' '}
                </Container>
            </Navbar>
        </>
    )
}