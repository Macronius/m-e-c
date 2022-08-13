//react
import React, { useContext, useEffect, useReducer } from 'react';
//react router dom
import { Link, useNavigate } from 'react-router-dom';
//axios
import Axios from 'axios';
//context
import { Store } from '../store';
//components
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';
//utility functions
import { getError } from '../utils';
//react bootstrap
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
//other
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';


//local reducer
const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return {...state, loading: true};
        case 'CREATE_SUCCESS':
            return {...state, loading: false};
        case 'CREATE_FAIL':
            return {...state, loading: false};
        default:
            return state;
    }
    //QUESTION: why does CREATE_FAIL not do anything to handle an error?
}

export default function PlaceOrderScreen() {

  //navigate
  const navigate = useNavigate();

  //reducer
  const [{loading}, dispatch] = useReducer(reducer, {loading: false});

  //destructure state
  const { state, dispatch: contextDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  //calculations
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100;
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );
  //free shipping?
  cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
  //calculate tax amount at 15%
  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  //calculate total price
  cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

  const placeOrderHandler = async () => {
    try {
        //initiate request UX
        dispatch({type: 'CREATE_REQUEST'});
        //send AJAX request to determine if data is coming from a logged-in user or a hacker
        const {data} = await Axios.post(
            //url
            '/api/orders',
            //data
            {
                orderItems: cart.cartItems,
                shippingAddress: cart.shippingAddress,
                paymentMethod: cart.paymentMethod,
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
            },
            //options
            {
                headers: {
                    authorization: `Bearer ${userInfo.token}`,
                },
            }
        );
        //clear the cart (for next purchase)
        contextDispatch({type: 'CART_CLEAR'});
        dispatch({type: 'CREATE_SUCCESS'});
        localStorage.removeItem('comtryaCart'); //QUESTION: why not handle this line in the store case 'CART_CLEAR'? 
        navigate(`/order/${data.order._id}`); //NOTE: data comes from backend, so the created order needs to be passed from backend to frontend to redirect users to the correct page
    }
    catch (err) {
        dispatch({type: 'CREATE_FAIL'});
        toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4 />

      <Helmet>
        <title>Place Order</title>
      </Helmet>
      <h1 className="my-3">Place Order</h1>

      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Shipping</Card.Title>
              <Card.Text>
                <strong>Name: </strong>
                {cart.shippingAddress.fullName}
                <br />
                <strong>Address: </strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </Card.Text>
              <Link to="/shipping">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method: </strong>
                {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Items</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        />{' '}
                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>${item.price}</Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/cart">Edit</Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Order Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>I<Col>${cart.itemsPrice.toFixed(2)}</Col>I
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${cart.shippingPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Order Total</strong>
                    </Col>
                    <Col>
                      <strong>${cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeOrderHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Place Order
                    </Button>
                  </div>
                  {
                    loading  &&  <LoadingBox />
                  }
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
