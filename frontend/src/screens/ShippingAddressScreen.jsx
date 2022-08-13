//react
import React, { useContext, useEffect, useState } from 'react';
//react router dom
import { useNavigate } from 'react-router-dom';
// import { useLocation, useNavigate } from 'react-router-dom';
//components
import CheckoutSteps from '../components/CheckoutSteps';
//context
import { Store } from '../store';
//react bootstrap
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
//extra stuff
import { Helmet } from 'react-helmet-async';


export default function ShippingAddressScreen() {

    const navigate = useNavigate();
    // const location = useLocation();
    // const redirectValueInUrl = new URLSearchParams(location.search).get('redirect');
    // const redirect = redirectValueInUrl ? redirectValueInUrl : '/';

    const {state, dispatch: contextDispatch} = useContext(Store);
    console.log("state: ", state);
    //destructure shippingAddress out from state
    const {cart: {shippingAddress}, userInfo} = state;

    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');

    useEffect(() => {
        if (!userInfo) {
            navigate('/signin?redirect=/shipping');
        }
    }, [userInfo, navigate])

    const submitHandler = e => {
        e.preventDefault();
        //dispatch an action to save in context
        contextDispatch({
            type: 'SAVE_SHIPPING_ADDRESS',
            payload: {
                fullName,
                address,
                city,
                postalCode,
                country
            }
        });
        //save to localStorage
        localStorage.setItem(
            'comtryaShippingAddress',
            JSON.stringify({
                fullName,
                address,
                city,
                postalCode,
                country
            })
        );
        //redirect user to next step
        navigate('/payment');
    }


    return (
        <div>
            <Helmet>
                <title>Shipping Address</title>
            </Helmet>

            <CheckoutSteps step1 step2 />
            <div className="container small-container">
                <h1 className="my-3">Shipping Address</h1>

                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control 
                            value={fullName}
                            onChange={ e => setFullName(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="address">
                        <Form.Label>Address</Form.Label>
                        <Form.Control 
                            value={address}
                            onChange={ e => setAddress(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control 
                            value={city}
                            onChange={ e => setCity(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="postalCode">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control 
                            value={postalCode}
                            onChange={ e => setPostalCode(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="country">
                        <Form.Label>Country</Form.Label>
                        <Form.Control 
                            value={country}
                            onChange={ e => setCountry(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <div className="mb-3">
                        <Button variant="primary" type="submit">
                            Continue
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}