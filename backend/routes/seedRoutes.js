import express from 'express';
import data from '../data.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
    //remove all previous records in the product model
    // await Product.remove({});
    await Product.deleteMany({});
    //seed
    const createdProducts = await Product.insertMany(data.products);

    //remove all previous records in the user model
    // await User.remove({});
    await User.deleteMany({});
    //seed
    const createdUsers = await User.insertMany(data.users);


    //send products forward to the frontend
    res.send({createdProducts, createdUsers});
});

export default seedRouter;