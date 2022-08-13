//react
import React, { useContext, useEffect, useState } from 'react';
//react router dom
import { useNavigate } from 'react-router-dom';
//context
import { Store } from '../store';
//components
import CheckoutSteps from '../components/CheckoutSteps';
//react bootstrap
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
//other
import { Helmet } from 'react-helmet-async';


export default function PaymentMethodScreen() {

    //navigation
    const navigate = useNavigate();


    const {state, dispatch: contextDispatch} = useContext(Store);
    const {cart: {shippingAddress, paymentMethod}} = state;

    //state
    const [paymentMethodName, setPaymentMethodName] = useState(
        paymentMethod || 'PayPal'
    );

    //if previous step not complete, then navigate to previous step
    useEffect( () => {
        if (!shippingAddress) {
            navigate('/shipping');
        }
    }, [navigate, shippingAddress]);

    

    const submitHandler = e => {
        e.preventDefault();
        //dispatch the save payment method action
        contextDispatch({type: 'SAVE_PAYMENT_METHOD', payload: paymentMethodName});
        //save payment method to local storage
        localStorage.setItem('comtryaPaymentMethod', paymentMethodName);
        //redirect user to the next checkout step
        navigate('/placeorder');

    }

    return (
        <div>
            <CheckoutSteps step1 step2 step3 />
            <div className="container small-container">
                <Helmet>
                    <title>Payment Method</title>
                </Helmet>
                <h1 className="my-3">Payment Method</h1>
                <Form onSubmit={submitHandler}>
                    <Form.Check
                        type="radio"
                        id="PayPal"
                        label="PayPal"
                        value="PayPal"
                        checked={paymentMethodName === 'PayPal'}
                        onChange={ e => setPaymentMethodName(e.target.value)}
                    />
                    <Form.Check
                        type="radio"
                        id="Stripe"
                        label="Stripe"
                        value="Stripe"
                        checked={paymentMethodName === 'Stripe'}
                        onChange={ e => setPaymentMethodName(e.target.value)}
                    />
                    <div className="mt-3">
                        <Button type="submit">Contiue</Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}