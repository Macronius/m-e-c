//react
import React, { useContext, useEffect, useState } from 'react';
//react router dom
import { Link, useLocation, useNavigate } from 'react-router-dom';
//components
import CheckoutSteps from '../components/CheckoutSteps';
//axios
import Axios from 'axios';
//context
import { Store } from '../store';
//utils
import { getError } from '../utils';
//react bootstrap
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
//react helmet async
import { Helmet } from 'react-helmet-async';
//react toastify
import { toast } from 'react-toastify';


export default function SignInScreen() {

    /*to get the redirect value from the url*/
    const navigate = useNavigate();
    //grab search part of url
    const { search } = useLocation();
    //get the redirect part
    const redirectInUrl = new URLSearchParams(search).get('redirect'); //NOTE: value = 'shipping'
    //set redirect value
    const redirect = redirectInUrl ? redirectInUrl : '/';

    //states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //store-context
    const {state: {userInfo}, dispatch: dispatchContext} = useContext(Store);
    //QUESTION: why not just let it be called 'dispatch'?  Will there be mutliple contexts?

    //submit handler function
    const submitHandler = async e => {
        e.preventDefault();
        //post sign-in input states
        try {
            //send AJAX request to backend; NOTE: email and password are states
            const {data} = await Axios.post('/api/users/signin', {
                email,
                password,
            });
            //save information to context store
            dispatchContext({type: 'USER_SIGNIN', payload: data});
            //save information to local storage
            localStorage.setItem('comtryaUserInfo', JSON.stringify(data));
            //direct user to redirect variable
            navigate(redirect  ||  '/');
        }
        catch (err) {
            toast.error(getError(err));
        }
    };

    //useEffect to handle signin screen while already signed in
    useEffect( () => {
        if (userInfo) {
            navigate(redirect)
        }
    }, [navigate, redirect, userInfo])

    return (
        <Container className="small-container">
            <Helmet>
                <title>Sign In</title>
            </Helmet>

            {/* <CheckoutSteps step1 /> */}
            <CheckoutSteps step1="step1" />
            <h1>Sign In</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                        type="email" 
                        required
                        onChange={ e => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        required
                        onChange={ e => setPassword(e.target.value)}
                    />
                </Form.Group>

                <div className="mb-3">
                    <Button type="submit">Sign In</Button>
                </div>

                <div className="mb-3">
                    New Customer?{' '}<Link to={`/signup?redirect=${redirect}`}>Create your new account</Link>
                </div>
            </Form>

        </Container>
    )
}