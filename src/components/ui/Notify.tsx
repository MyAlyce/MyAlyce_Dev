import React from 'react';
import CardGroup from 'react-bootstrap/CardGroup';
import { UserAlerts } from './UserAlerts.tsx';
import { UserMessages } from './UserMessages.tsx';

export function Notify() {
  return (
    <CardGroup>
        <UserAlerts/>
        <UserMessages/>
    </CardGroup>
  );
}