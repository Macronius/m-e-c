//JAVASCRIPT LIBRART
import React, { useEffect, useReducer, useState } from 'react';
//ROUTING
import { Link, useLocation, useNavigate } from 'react-router-dom';
//HTTP PROTOCOL: axios
import axios from 'axios';
//COMPONENTS
import Rating from '../components/Rating';
import Product from '../components/Product';
//UX: third party
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
//utility functions
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//STYLE: react bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
import Button from 'react-bootstrap/Button';

//local reducer function
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        // error,
        products: action.payload.products,
        pages: action.payload.pages,
        page: action.payload.page,
        countProducts: action.payload.countProducts,
      };
    case 'FETCH_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

//user interface
const prices = [
  {
    name: '$1 to $50',
    value: '1-50', //pass value as a query string to the backend
  },
  {
    name: '$51 to $200',
    value: '51-200',
  },
  {
    name: '$201 to $1000',
    value: '201-1000',
  },
];

export const ratings = [
  {
    name: '4 stars & up',
    rating: 4,
  },
  {
    name: '3 stars & up',
    rating: 3,
  },
  {
    name: '2 stars & up',
    rating: 2,
  },
  {
    name: '1 stars & up',
    rating: 1,
  },
];

export default function SearchScreen() {
  //navigate
  const navigate = useNavigate();
  //search params and filter
  const { search } = useLocation();
  const sp = new URLSearchParams(search); // /search?category=Shirts
  //instantiate local constant values
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;
  //local reducer - initiate perform action with said data
  const [{ loading, error, products, pages, countProducts }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  //first-render effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        //api to filter products
        const { data } = await axios.get(
          `/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [page, query, category, price, rating, order, error]);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, [dispatch]);

  //filter action
  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterRating = filter.rating || rating;
    const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    //
    // return `/search?page=${filterPage}&query=${filterQuery}&category=${filterCategory}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}`;
    return `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
  };

  return (
    <div>
      <Helmet>
        <title>Search Products</title>
      </Helmet>
      <Row>
        <Col md={3}>
          {/* FILTER - DEPARTMENT */}
          <div>
            <h3>Department</h3>
            <ul>
              <li>
                <Link
                  className={category === 'all' ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Any
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    to={getFilterUrl({ category: c })}
                    className={c === category ? 'text-bold' : ''}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* FILTER - PRICE */}
          <div>
            <h3>Price</h3>
            <ul>
              <li>
                {/* remove price range filter and display all */}
                <Link
                  to={getFilterUrl({ price: 'all' })}
                  className={price === 'all' ? 'text-bold' : ''}
                >
                  Any
                </Link>
              </li>
              {prices.map((p) => (
                <li key={p.value}>
                  <Link
                    to={getFilterUrl({ price: p.value })}
                    className={price === p.value ? 'text-bold' : ''}
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* FILTER - AVERAGE CUSTOMER REVIEW */}
          <div>
            <h3>Average Customer Review</h3>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    // className={rating === r.rating ? 'text-bold' : ''}
                    className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}
                  >
                    {/* <Rating caption={' & up'} rating={r.rating} /> */}
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={rating === 'all' ? 'text-bold' : ''}
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3">
                <Col md={6}>
                  <div>
                    {countProducts === 0 ? 'No' : countProducts} Results
                    {query !== 'all' && ` : ${query}`}
                    {category !== 'all' && ` : ${category}`}
                    {price !== 'all' && ` : Price ${price}`}
                    {rating !== 'all' && ` : Rating ${rating} & up`}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ||
                    price !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Sort by{' '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="lowest">Price: Low to High</option>
                    <option value="highest">Price: High to Low</option>
                    <option value="toprated">Average Customer Reviews</option>
                  </select>
                </Col>
              </Row>
              {products.length === 0 && (
                <MessageBox>No Product Found</MessageBox>
              )}
              {/* PRODUCTS */}
              <Row>
                {products.map((product) => (
                  <Col sm={6} lg={4} className="mb-3" key={product._id}>
                    <Product product={product}></Product>
                  </Col>
                ))}
              </Row>
              {/* PAGINATION */}
              <div>
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
