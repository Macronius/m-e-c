//react
import React, { useContext } from 'react';
//react router dom
import { Link, useNavigate } from 'react-router-dom';
//axios
import axios from 'axios';
//context
import { Store } from '../store';
//components
import MessageBox from '../components/MessageBox';
//extra components
import { Helmet } from 'react-helmet-async';
//react bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';



export default function CartScreen() {

    const navigate = useNavigate();

  const { state, dispatch: contextDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  // +/-button handler
  const updateCartHandler = async (item,quantity) => {

    //logic to determine if should proceed
    const result = await axios.get(`/api/products/${item._id}`);
    const {data} = result;

    if (data.countInStock < quantity) {
        //if consumer requests more than in inventory
        window.alert("Sorry, we have not enough minerals");
        return;
    }
    contextDispatch({
        type: 'CART_ADD_ITEM',
        payload: {...item, quantity}
    })
  }

  // trash handler
  const removeItemHandler = item => {
    contextDispatch({
        type: 'CART_REMOVE_ITEM',
        payload: item
    })
  }

  // checkout handler
  const checkoutHandler = () => {
    navigate('/signin?redirect=/shipping');
  }

  return (
    <div>
      <Helmet>
        <title>Shopping Cart</title>
      </Helmet>
      <h1>Shopping Cart</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <MessageBox>
              Cart is empty. <Link to="/">Continue shopping</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounted img-thumbnail"
                      ></img>{' '}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>
                    <Col md={3}>
                      <Button 
                        variant="light" 
                        disabled={item.quantity === 1}
                        onClick={ () => updateCartHandler(item, item.quantity -1)}
                      >
                        <i className="fas fa-minus-circle"></i>
                      </Button>{' '}
                      <span>{item.quantity}</span>{' '}
                      <Button
                        variant="light"
                        disabled={item.quantity === item.countInStock}
                        onClick={ () => updateCartHandler(item, item.quantity +1)}
                      >
                        <i className="fas fa-plus-circle"></i>
                      </Button>
                    </Col>
                    <Col md={3}>${item.price}</Col>
                    <Col md={2}>
                      <Button 
                        variant="light"
                        onClick={ () => removeItemHandler(item)}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>
                    Subtotal (
                    {cartItems.reduce(
                      (accumulator, current) => accumulator + current.quantity,
                      0
                    )}{' '}
                    items): $
                    {cartItems.reduce(
                      (accumulator, current) => accumulator + current.price * current.quantity,
                      0
                    )}
                  </h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      variant="primary"
                      disabled={cartItems.length === 0}
                      onClick={checkoutHandler}
                    >
                      Proceed to checkout
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
