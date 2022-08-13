import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import { Store } from '../store';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../utils';

//local reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
//QUESTION: how to know when a function goes outside the export or inside?
//QUESTION: why not just make this a reducer for import since it is used multiple times?
//ANSWER: this one is actually unique to orders

export default function OrderHistoryScreen() {
  //navigate
  const navigate = useNavigate();

  //get user info from context
  const { state } = useContext(Store);
  const { userInfo } = state; //to be used in the useEffect

  //useReducer
  const [{ loading, orders, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  //fetch data from backend upon initial load
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get('/api/orders/mine', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({type: 'FETCH_SUCCESS', payload: data});
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div>
      <Helmet>
        <title>Order History</title>
      </Helmet>
      <h1 className="my-3">Order History</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {
                orders.map( order => (
                    <tr key={order._id}>
                        <td>{order._id}</td>
                        <td>{order.createdAt.substring(0,10)}</td>
                        <td>{order.totalPrice.toFixed(2)}</td>
                        <td>{order.isPaid ? order.paidAt.substring(0,10) : 'No'}</td>
                        <td>{order.isDelivered ? order.deliveredAt.substring(0,10) : 'No'}</td>
                        <td>
                            <Button
                                type="button"
                                variants="light"
                                onClick={ () => {
                                    navigate(`/order/${order._id}`);
                                }}
                            >
                                Details
                            </Button>
                        </td>
                    </tr>
                ))
            }
          </tbody>
        </Table>
      )}
    </div>
  );
}
