import express from 'express';
import expressAsyncHandler from 'express-async-handler';
//backend models
import Product from '../models/productModel.js';
//utility functions
import { isAdmin, isAuth } from '../utils.js';

const productRouter = express.Router();

//local root:
productRouter.get('/', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});
productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler( async (req, res) => {
    const newProduct = new Product(
      {
        name: `sample name ${Date.now()}`,
        slug: `sample-name-${Date.now()}`,
        category: 'sample category',
        image: '/images/p1.jpg',
        price: 0,
        countInStock: 0,
        brand: 'sample brand',
        rating: 0,
        numReviews: 0,
        description: 'sample description',
      }
    )
    const product = await newProduct.save(); //QUESTION: what exactly is happening here? / product is saved in the database and the information is saved in the product object
    //send product to frontend
    res.send({message: 'Product Created', product})
  })
);

// api - update product
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler( async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);  //get the product
    if (product) {
      //update product information
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      //save model
      await product.save();
      //send response
      res.send({message: 'Product Updated Successfully'})
    }
    else {
      res.status(404).send({message: 'Product Not Found'});
    }
  })
);

// api - delete product
productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler( async (req, res) => {
  const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.send({message: "Product deleted"});
    }
    else {
      res.status(404).send({message: "Product not found"});
    }
  })
);


//constant
const PAGE_SIZE = 3;

//admin apis
productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler( async(req, res) => {
    // console.log("req: ", req);
    const {query} = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page -1))
      .limit(pageSize);
    //count number of documents from mongoose
    const countProducts = await Product.countDocuments();
    //return to frontend
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    })
  })
);

//filter api
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    //get the query object from req
    const { query } = req;
    //everything from query object
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';
    //note: query filter - if particular query, then set object to search query value
    //note: this will be the object passed to the find() method of the Product model
    //FILTERS
    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            //get min-max
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };
    //find
    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...ratingFilter,
      ...priceFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    //send
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product not found /:slug' });
  }
});

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found /:id' });
  }
});

export default productRouter;
