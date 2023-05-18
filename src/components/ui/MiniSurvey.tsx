import React from 'react';
import Button from 'react-bootstrap/Button';

export function MiniSurvey (){
    return (
        <>
        <hr />
        <div className="d-grid gap-2">
            <Button style={{ marginBottom: '4rem' }} variant="primary">Mini Survey</Button>
        </div>
        </>
    )
}