//javascript library
import React, { useContext, useEffect, useReducer } from 'react';
//react router dom
import { useNavigate } from 'react-router-dom';
//ajax request
import axios from 'axios';
//context
import { Store } from '../store';
//utility functions
import { getError } from '../utils';
//components
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//third-party components
import { Helmet } from 'react-helmet-async';
//react bootstrap
import Button from 'react-bootstrap/Button';

//experiementation
console.log("React: ", React);

//local reducer
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return {...state, loading: true};
        case 'FETCH_SUCCESS':
            return {...state, loading: false, orders: action.payload};
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload};
        default: 
            return state;
    }
}

//functional component
export default function OrderListScreen() {
    //navigation
    const navigate = useNavigate();
    //get userInfo from context-state to authenticate
    const {state} = useContext(Store);
    const {userInfo} = state;
    //reducer
    const [{loading, orders, error}, dispatch] = useReducer(reducer, {loading: true, error: ''})
    console.log("orders: ", orders);
    //rendering effect
    useEffect( () => {
        const fetchData  = async () => {
            try {
                dispatch({type: 'FETCH_REQUEST'})
                const {data} = await axios.get(
                    '/api/orders',
                    {
                        headers: {Authorization: `Bearer ${userInfo.token}`}
                    }
                );
                dispatch({type: 'FETCH_SUCCESS', payload: data});
            }
            catch (err) {
                dispatch({type: 'FETCH_FAIL', payload: getError(err)})
            }
        };
        fetchData();
    }, [userInfo])
    //UI
  return (
    <div>
        <Helmet>
            <title>Orders</title>
        </Helmet>
        <h1>Orders</h1>
        {/* conditional rendering */}
        {
            loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>USER</th>
                            <th>DATE</th>
                            <th>TOTAL</th>
                            <th>PAID</th>
                            <th>DELIVERD</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            orders.map( order => {
                                console.log("order: ", order);
                                return (
                                    <tr key={order._id}>
                                        <td>{order._id}</td>
                                        <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                                        <td>{order.createdAt.substring(0,10)}</td>
                                        <td>${order.totalPrice.toFixed(2)}</td>
                                        <td>{order.isPaid ? order.paidAt.substring(0,10) : 'No'}</td>
                                        <td>{order.isDelivered ? order.deliveredAt.substring(0,10) : 'No'}</td>
                                        <td>
                                            <Button
                                                type="button"
                                                variant="light"
                                                onClick={ () => {
                                                    navigate(`/order/${order._id}`);
                                                }}
                                            >
                                                Order Details
                                            </Button>
                                        </td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            )
        }
    </div>
  )
}
