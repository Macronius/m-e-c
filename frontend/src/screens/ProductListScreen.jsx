//library
import React, { useContext, useEffect, useReducer } from 'react';
//react router dom
import { Link, useLocation, useNavigate } from 'react-router-dom';
//html fetch
import axios from 'axios';
//context
import { Store } from '../store';
//components
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//components - 3rd party
import { Helmet } from 'react-helmet-async';
// components - react bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { getError } from '../utils';
import { toast } from 'react-toastify';
//

// 1. define reducer to manage state of fetching products from backend
const reducer = (state, action) => {
  switch (action.type) {
// --- fetch
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
// --- create
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false }; //QUESTION: what is the point of SUCCESS and FAIL being the
// --- delete
    case 'DELETE_REQUEST':
      return {...state, loadingDelete: true, successDelete: false};
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true};
    case 'DELETE_FAIL':
      return {...state, loadingDelete: false, successDelete: false};
    case 'DELETE_RESET':
      return {...state, loadingDelete: false, successDelete: false};
// --- default
    default:
      return state;
  }
  //QUESTION: because this is frontend to frontend, this means am not concerned with (res, req) ?
};

//
// functional component
export default function ProductListScreen() {
  const navigate = useNavigate();
  //

  // 4. get destination from url
  const { search } = useLocation();
  const search_parameter_object = new URLSearchParams(search);
  const page = search_parameter_object.get('page') || 1; //if no page provided, default to page one
  //

  // 5. use context to retrieve userInfo
  const { state } = useContext(Store);
  const { userInfo } = state;
  //

  // 2. define useReducer() - extract these values from the context-state
  const [
    { 
      loading, 
      products, 
      pages, 
      error, 
      loadingCreate,
      loadingDelete,
      successDelete,
    }, 
    dispatch
  ] =
    useReducer(
      //TODO: change 'dispatch' to 'productDispatch'
      reducer,
      {
        loading: true,
        error: '',
        //QUESTION: why is it good to be able to test multiple ways, undefined, or empty string, or null?  how can I be more strategic about the subtleties
      }
    );
  //

  // 3. initialize with useEffect()
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `/api/products/admin?page=${page}`, //because the page title is same as the page content, the api url can simply piggy-back off of current screen url
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', error: err });
      }
    };
    //
    if (successDelete) {
      dispatch({type: 'DELETE_RESET'});
    }
    else {
      fetchData();
    }
  }, [page, userInfo, successDelete]); //if page changes or user changes
  //

  // 6. create product handler
  const createHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/products',
          {}, //QUESTION: why empty object? answer?: to instantiate something to work with,
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('product created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
        navigate(`/admin/product/${data.product._id}`); //QUESTION: what exactly is going on here?
      } catch (err) {
        //UX
        toast.error(getError(err));
        //
        dispatch({ type: 'CREATE_ERROR', error: err });
      }
    }
  };
  //
  // 7. delete product handler
  const deleteHandler = async product => {
    if (window.confirm('Are you sure you want to delete this item?  It cannot be undone.')) {
      try {
        dispatch({type: 'DELETE_REQUEST'});
        await axios.delete(
          `/api/products/${product._id}`,
          {
            headers: {Authorization: `Bearer ${userInfo.token}`},
          }
        );
        toast.success('product deleted successfully');
        dispatch({type: 'DELETE_SUCCESS'});
      }
      catch (err) {
        toast.error(getError(err));
        dispatch({type: 'DELETE_FAIL'})
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Products</title>
      </Helmet>

      <Row>
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler}>
              Create Product
            </Button>
          </div>
        </Col>
      </Row>

      {/* check loading */}
      {loadingCreate && <LoadingBox />};
      {loadingDelete && <LoadingBox />};

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>ACTIONS</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Button //redirect user to the ProductEditScreen
                      type="button"
                      variant="light"
                      onClick={() => navigate(`/admin/product/${product._id}`)}
                    >
                      Edit
                    </Button>
                    &nbsp;&nbsp;
                    <Button //redirect user to the ProductEditScreen
                      type="button"
                      variant="light"
                      onClick={() => deleteHandler(product)}
                    >
                      Delete
                    </Button>
                  </td>
                  <td>{product._id}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                key={x + 1}
                to={`/admin/products?page=${x + 1}`}
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
