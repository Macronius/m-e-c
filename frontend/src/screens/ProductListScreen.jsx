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

// 1. define reducer to manage state of fetching products from backend
const reducer = (state, action) => {
  switch (action.type) {
    //fetches
    case 'FETCH_REQUEST':
      return { ...state, loading: true};
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload};
      //creates
      case 'CREATE_REQUEST':
        return { ...state, loadingCreate: true};
      case 'CREATE_SUCCESS':
        return { ...state, loadingCreate: false};
      case 'CREATE_FAIL':
        return { ...state, loadingCreate: false};   //QUESTION: what is the point of SUCCESS and FAIL being the same outcome?
    default:
      return state;
  }
  //QUESTION: because this is frontend to frontend, this means am not concerned with (res, req) ?
};

export default function ProductListScreen() {
    const navigate = useNavigate()

  // test
  // const location = useLocation();
  // console.log('location: ', location);
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

  // 2. define useReducer() inside the ProductListScreen
  const [{ loading, products, pages, error, loadingCreate }, localDispatch] = useReducer(  //TODO: change 'localDispatch' to 'productDispatch'
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
    const fetchInitialData = async () => {
      try {
        localDispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `/api/products/admin?page=${page}`, //because the page title is same as the page content, the api url can simply piggy-back off of current screen url
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );
        localDispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        localDispatch({ type: 'FETCH_FAIL', error: err });
      }
    };
    fetchInitialData();
  }, [page, userInfo]); //if page changes or user changes
  //

  // 6. create product handler
  const createHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
        try {
            localDispatch({type: 'CREATE_REQUEST'});
            const {data} = await axios.post(
                '/api/products',
                {},     //QUESTION: why empty object? answer?: to instantiate something to work with,
                {
                    headers: {Authorization: `Bearer ${userInfo.token}`},
                }
            );
            toast.success('product created successfully');
            localDispatch({type: 'CREATE_SUCCESS'});
            navigate(`/admin/product/${data.product._id}`);     //QUESTION: what exactly is going on here?
        }
        catch (err) {
            //UX
            toast.error(getError(err));
            //
            localDispatch({type: 'CREATE_ERROR', error: err})
        }
    }
  };
  //

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
                <Button type="button" onClick={createHandler}>Create Product</Button>
            </div>
        </Col>
      </Row>

        {/* create */}
      {
        loadingCreate && <LoadingBox />
      }

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
              </tr>
            </thead>
            <tbody>
              {products.map((x) => (
                <tr key={x._id}>
                  <td>{x._id}</td>
                  <td>{x.name}</td>
                  <td>${x.price.toFixed(2)}</td>
                  <td>{x.category}</td>
                  <td>{x.brand}</td>
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
