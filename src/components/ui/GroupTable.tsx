import React from 'react';
import Table from 'react-bootstrap/Table';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import profilePic from '../assets/JoshBrew.jpg';
import profilePic2 from '../assets/Alex-Shohet.jpg';
import profilePic3 from '../assets/Eric-H.jpg';

export function GroupTable (){
    return (
        <>
        <h3>Group Monitoring </h3>
        <Table responsive striped bordered hover size="sm">
      <thead>
        <tr>
          <th>User Name</th>
          <th>Stats</th>
          <th>Alerts</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><img className="rounded-circle" width="50" alt="Josh" src={profilePic} />&nbsp;Josh Brewster</td>
          <td>Some Stats</td>
          <td><Button variant="danger">
          Alerts <Badge bg="info">2</Badge>
          <span className="visually-hidden">unread messages</span></Button>
          </td>
        </tr>
        <tr>
          <td><img className="rounded-circle" width="50" alt="Alex" src={profilePic2} />&nbsp;Alex Shohet</td>
          <td>Some Stats</td>
          <td><Button variant="warning">
          Alerts <Badge bg="accent1">1</Badge>
          <span className="visually-hidden">unread messages</span></Button>
          </td>
        </tr>
        <tr>
          <td colSpan={2}><img className="rounded-circle" width="50" alt="Eric" src={profilePic3} />&nbsp;Eric Harris</td>
          <td><Button variant="info">
          Alerts <Badge bg="accent2">8</Badge>
          <span className="visually-hidden">unread messages</span></Button>
          </td>
        </tr>
      </tbody>
    </Table>
        </>
    )
}
