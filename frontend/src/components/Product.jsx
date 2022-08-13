//react
import React, { useContext } from 'react';
//react router dom
import { Link } from 'react-router-dom';
//axios
import axios from 'axios';
//react-bootstrap
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
//components
import Rating from './Rating';
//context
import { Store } from '../store';


const Product = ({product}) => {

    const { state, dispatch: contextDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    const addToCartHandler = async (item) => {

        const existItem = cartItems.find( d => d._id === product._id);
        const quantity = existItem ? existItem.quantity +1 : 1; //QUESTION: how did existItem get a quantity value?

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

    return (
        <Card className="product">
            <Link to={`/product/${product.slug}`}>
                <img src={product.image} alt={product.name} className="card-img-top" />
            </Link>
            <Card.Body>
                <Link to={`/product/${product.slug}`}>
                    <Card.Title>{product.name}</Card.Title>
                </Link>
                <Rating rating={product.rating} numbReviews={product.numReviews} />
                <Card.Text>${product.price}</Card.Text>
                {
                    product.countInStock === 0 ? (
                        <Button variant="light" disabled>Out of stock</Button>
                    ) : (
                        <Button onClick={ () => addToCartHandler(product)}>Add to cart</Button>
                    )
                }
            </Card.Body>
        </Card>
    )
}

export default Product;