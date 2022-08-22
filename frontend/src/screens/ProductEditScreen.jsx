//javascript library
import React, { useContext, useEffect, useReducer, useState } from 'react';
//react router dom
import { useNavigate, useParams } from 'react-router-dom';
//http fetch
import axios from 'axios';
//context
import { Store } from '../store';
//utility functions
import { getError } from '../utils';
//style
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
//components
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//components - 3rd party
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';



//reducer to handle state of fetching data from backend //NOTECARD IMPORTANT
const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return {...state, loading: true};
        case 'FETCH_SUCCESS':
            return {...state, loading: false};
        case 'FETCH_FAIL':
            return {...state, loading: false, error: action.payload};
        case 'UPDATE_REQUEST':
            return {...state, loadingUpdate: true};
        case 'UPDATE_SUCCESS':
            return {...state, loadingUpdate: false};
        case 'UPDATE_FAIL':
            return {...state, loadingUpdate: false};
        case 'UPLOAD_REQUEST':
            return {...state, loadingUpload: true, errorUpload: ''};
        case 'UPLOAD_SUCCESS':
            return {...state, loadingUpload: false, errorUpload: ''};
        case 'UPLOAD_FAIL':
            return {...state, loadingUpload: false, errorUpload: action.payload};
        default:
            return state;
    }
}
//QUESTION: why is this outside the rfc
//QUESTION: what exactly is the rfc?  the entire file or just the component being exported

export default function ProductEditScreen() {

    //react router dom stuff
    const {id: productId} = useParams(); // /product/:id
    // const params = useParams(); // /product/:id
    // const {id: productId} = params;
    const navigate = useNavigate();

    // --- context for authentication to request for fetch product-details from backend
    const {state} = useContext(Store);
    const {userInfo} = state;
    // const [{state: userInfo}] = useContext(Store);
    // --- reduce
    const [{loading, error, loadingUpdate, loadingUpload}, dispatch] = useReducer(reducer, {
        loading: true,
        error: '',
    });
    // --- states
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [countInStock, setCountInStock] = useState('');
    const [description, setDescription] = useState('');
    // --- initialize - fetch data from backend
    useEffect( () => {
        const fetchData = async () => {
            try {
                dispatch({type: 'FETCH_REQUEST'});
                const {data} = await axios.get(`/api/products/${productId}`);
                //fill the input boxes with data using states
                setName(data.name);
                setSlug(data.slug);
                setPrice(data.price);
                setImage(data.image);
                setCategory(data.category);
                setBrand(data.brand);
                setCountInStock(data.countInStock);
                setDescription(data.description);
                dispatch({type: 'FETCH_SUCCESS'});
            }
            catch (err) {
                dispatch({type: 'DISPATCH_FAIL', payload: getError(err)})
            }
        }
        fetchData();
    }, [productId])

    //form submit handler
    const submitHandler = async e => {
        e.preventDefault();
        try {
            dispatch({type: 'UPDATE_REQUEST'});
            await axios.put(
                // 1st parameter: url
                `/api/products/${productId}`,
                // 2nd parameter: payload
                {
                    _id: productId,
                    name,
                    slug,
                    price,
                    image,
                    category,
                    brand,
                    countInStock,
                    description,
                },
                // 3rd parameter: authorization
                {
                    headers: {Authorization: `Bearer ${userInfo.token}`}
                }
            );
            dispatch({type: 'UPDATE_SUCCESS'});
            toast.success('Product successfully updated');
            navigate('/admin/products')
        }
        catch (err) {
            toast.error(getError(err))
            dispatch({type: 'UPDATE_FAIL'})
        }
    }

    const uploadFileHandler = async e => {
        //get file from event
        const file = e.target.files[0]; //QUESTION: does e.target have a files array becaue of multer?
        //
        const bodyFormData = new FormData();
        //add record to bodyFormData called 'file'
        bodyFormData.append('file', file);
        //axios.post bodyFormData
        try {
            dispatch({type: 'UPLOAD_REQUEST'});
            const {data} = await axios.post(    //QUESTION: why does axios.post return a const value data?
                '/api/upload',
                bodyFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        authorization: `Bearer ${userInfo.token}`,
                    },
                }
            );
            dispatch({type: 'UPLOAD_SUCCESS'});
            toast.success('Image uploaded successfully');
            setImage(data.secure_url);
        }
        catch (err) {
            toast.error(getError(err));
            dispatch({type: 'UPLOAD_FAIL', payload: getError(err)});
        }
    }

  return (
    <Container className="small-container">
        <Helmet>
            <title>Edit Product {productId}</title>
        </Helmet>
        <h1 className="my-3">Edit Product</h1>
        {/* content */}
        {
            loading ? (
                <LoadingBox />
            ) : error ? (
                <MessageBox variant="danger">{error}</MessageBox>
            ) : (
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control 
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="slug">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control 
                            required
                            value={slug}
                            onChange={e => setSlug(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="price">
                        <Form.Label>Price</Form.Label>
                        <Form.Control 
                            required
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="image">
                        <Form.Label>Image</Form.Label>
                        <Form.Control 
                            required
                            value={image}
                            onChange={e => setImage(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="imageFile">
                        <Form.Label>Upload File</Form.Label>
                        <Form.Control type="file" onChange={uploadFileHandler} />
                        {
                            loadingUpload && <LoadingBox />
                        }
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="category">
                        <Form.Label>Category</Form.Label>
                        <Form.Control 
                            required
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="brand">
                        <Form.Label>Brand</Form.Label>
                        <Form.Control 
                            required
                            value={brand}
                            onChange={e => setBrand(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="countInStock">
                        <Form.Label>Count In Stock</Form.Label>
                        <Form.Control 
                            required
                            value={countInStock}
                            onChange={e => setCountInStock(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control 
                            required
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </Form.Group>
                    <div className="mb-3">
                        <Button disabled={loadingUpdate} type="submit">
                            Update
                        </Button>
                        {
                            loadingUpdate && <LoadingBox />
                        }
                    </div>
                </Form>
            )
        }
    </Container>
  )
}
