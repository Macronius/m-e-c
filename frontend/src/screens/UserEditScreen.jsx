//javascript library
import React, { useContext, useEffect, useReducer, useState } from 'react';
//routing
import { useNavigate, useParams } from 'react-router-dom';
//ajax request
import axios from 'axios';
//context
import { Store } from '../store';
//utility functions
import { getError } from '../utils';
//components
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//components - 3rd party
import {toast} from 'react-toastify';
import { Helmet } from 'react-helmet-async';
//react bootstrap
import Button from 'react-bootstrap/esm/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    default:
      return state;
  }
};

export default function UserEditScreen() {
  // STORE REDUCER
  const [{ loading, loadingUpdate, error }, dispatch] = useReducer(
    reducer,
    { loading: true, error: '' }
  );

  // CONTEXT STATE
  const { state } = useContext(Store);
  const {userInfo} = state;

  // GET PARAMS FROM URL
  const params = useParams();
  const { id: userId } = params;

  // NAVIGATION
  const navigate = useNavigate();

  // HOOKED STATES
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  //
  // AVAILABLE ___
  // loading, loadingUpdate, error,                     <-- store reducer state
  // userInfo, userId,                                  <-- url params
  // name, email, isAdmin                               <-- state
  // navigate()                                         <-- react router dom
  //

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        //set controlled input states
        setName(data.name);
        setEmail(data.email);
        setIsAdmin(data.isAdmin);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userId, userInfo]);

  // SUBMIT HANDLER
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/users/${userId}`,                                     // api url
        { _id: userId, name, email, isAdmin },                      // data
        { headers: { Authorization: `Bearer ${userInfo.token}` } }  // authentication credentials
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      toast.success('User updates successfully');
      navigate('/admin/users');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  

  // RETURNED UI
  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit User</title>
      </Helmet>
      <h1>Edit User: {userId}</h1>

      {/* content */}
      {loading ? ( //<--troubleshoot: changed loading to loading
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={email}
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Check
            className="mb-3"
            type="checkbox"
            id="isAdmin"
            label="isAdmin"
            checked={isAdmin}
            onChange={e => setIsAdmin(e.target.checked)}
          />

          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox />}
          </div>
        </Form>
      )}
    </Container>
  );
}
