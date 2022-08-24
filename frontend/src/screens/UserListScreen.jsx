//javascript library
import React, { useContext, useEffect, useReducer } from 'react';
//routing
import { useNavigate } from 'react-router-dom';
//ajax request
import axios from 'axios';
//context
import { Store } from '../store';
//components
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
//components - 3rd party
import { Helmet } from 'react-helmet-async';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

// 3    reducer()
const reducer = (state, action) => {
  switch (action.type) {
    // --- fetch
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, users: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    // --- delete
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    // --- default
    default:
      return state;
  }
};

//
// FUNCTIONAL COMPONENT
export default function UserListScreen() {
  // 5    navigation
  const navigate = useNavigate();

  // 1    context state
  const { state } = useContext(Store);
  const { userInfo } = state;
  // console.log("userInfo: ", userInfo);

  // 2    useReducer()
  const [{ loading, error, users, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
      successDelete: false,
    });

  // 4    initialize / render
  useEffect(() => {
    //
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/users', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    //
    console.log("successDelete: ", successDelete);
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [userInfo, successDelete]);

  // 6    handler functionality
  const deleteHandler = async (user) => {
    if (window.confirm('Are you sure delete user.  This action cannot be undone.')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });
        await axios.delete(`/api/users/${user._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success( 'User successfully deleted... May God have mercy on their soul.');
        dispatch({ type: 'DELETE_SUCCESS' });
      } 
      catch (err) {
        toast.error(getError(err));
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  // return
  return (
    <div>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <h1>Users</h1>

      {loadingDelete && <LoadingBox />}

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>IS ADMIN</th>
              <th style={{ textAlign: 'center' }}></th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                <td></td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/admin/user/${user._id}`)}
                    className="btn-border-topleft"
                  >
                    Edit
                  </Button>
                  &nbsp; &nbsp;
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => deleteHandler(user)}
                    className="btn-border-topleft"
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
