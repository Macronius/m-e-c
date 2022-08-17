//express
import express from 'express';
//express async handler - to catch all errors
import expressAsyncHandler from 'express-async-handler';
//models
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
//utils
import { isAdmin, isAuth } from '../utils.js';

const orderRouter = express.Router();

//APIs

//root - /api/order
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log('req: ', req);
    //NOTE: req.user._id - need to define a middleware (isAuth) to fill the user object of request from the token
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({...x, product: x._id,})),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });
    const order = await newOrder.save();
    res.status(201).send({ message: 'Status 201 - Created: New Order Created', order });
  })
);





// ----- ----- summary - /api/order/summary - api endpoint  -  returns a summary report
orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    console.log("is expressAsyncHandler even getting run?");
    // --- backend code ? 
    // ORDERS   -   returns: 
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 }, // counter - one per item
          totalSales: { $sum: '$totalPrice' }, // name
        },
      },
    ]);
    // USERS
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    // DAILY ORDERS
    const dailyOrders = await Order.aggregate([
      {
        
        $group: { //group data based on date of order
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },   //QUESTION: what exactly is '$totalPrice' ?
        },
      },
      { $sort: { _id: 1 } }, //QUESTION: this line simply orders in ascending from previous stage?
    ]);
    // PRODUCT CATEGORIES
    const productCategories = await Product.aggregate([   //QUESTION: what exactly is happening here with the model
      {
        //NOTE: group data based on category in the productModel and count number of items in each category
        $group: {
          _id: '$category',
          count: { $sum: 1}
        },
      },
    ]);
    //send to the frontend
    res.send({orders, users, dailyOrders, productCategories});
  })
);





// ----- ----- mine orders -   /api/order /mine   - note: must be (lexically?) positioned before '/:id'
orderRouter.get(
  '/mine',
  isAuth, //NOTE: req.user._id will come from isAuth middleware
  expressAsyncHandler(async (req, res) => {
    //get it
    const orders = await Order.find({ user: req.user._id });
    //send it
    res.send(orders);
  })
);





// ----- -----  post - /api/order /:id
orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // console.log("req: ", req);
    //search the database for this order
    const order = await Order.findById(req.params.id);
    //return it to the frontend
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Status 404 - Order Not Found' });
    }
  })
);





// ----- ----- paypal - /:id/pay - update order status after payment
orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

export default orderRouter;
