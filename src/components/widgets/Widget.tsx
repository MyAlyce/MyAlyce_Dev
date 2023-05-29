import React, {Component} from 'react'
import { Card } from 'react-bootstrap'

export class Widget extends Component<{
    content:any, 
    style?:any
    title?:any,
    subtitle?:any
}> {
    
    render() {
        return (
            <Card style={ this.props.style }>
                <Card.Body>
                { this.props.title ? <Card.Title>{this.props.title}</Card.Title> : null}
                { this.props.subtitle ? <Card.Subtitle >{this.props.subtitle}</Card.Subtitle > : null}
                { this.props.content }
                </Card.Body>
            </Card>
        )
    }
}