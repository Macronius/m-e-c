//react
import React from 'react';
//react bootstrap
import Spinner from 'react-bootstrap/Spinner';

export default function LoadingBox() {

    return (
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    )
}