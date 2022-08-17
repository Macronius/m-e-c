//react
import React, { useState } from 'react';
//react router dom
import { useNavigate } from 'react-router-dom';
//react bootstrap
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

export default function SearchBox() {
    //navigate
    const navigate = useNavigate();
    //state
    const [query, setQuery] = useState('');
    //handler function
    const submitHandler = e => {
        e.preventDefault();
        navigate( query ? `/search/?query=${query}` : '/search');
        // navigate( query ? `/search?query=${query}` : '/search'); //troubleshoot
    };

  return (
    <Form className="d-flex me-auto" onSubmit={submitHandler}>
        <InputGroup>
            <FormControl
                type="text"
                name="q"
                id="q"
                onChange={ e => setQuery(e.target.value)}
                placeholder="search products..."
                aria-label="Search Products"
                aria-describedby="button-search"
            ></FormControl>
            <Button variant="outline-primary" type="submit" id="button-search">
                <i className="fas fa-search"></i>
            </Button>
            {/* NOTE: Button connect to FormControl by aria-describedby connects to id 'button-search' */}
        </InputGroup>
    </Form>
  )
}
