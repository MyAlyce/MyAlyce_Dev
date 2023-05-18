import React from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

export function NoteForm () {
  return (
    <Form>
      <InputGroup>
        <InputGroup.Text>Notes:</InputGroup.Text>
        <Form.Control as="textarea" aria-label="With textarea" />
      </InputGroup>
    </Form>
  )
}