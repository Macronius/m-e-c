//express
import express from 'express';
//express async handler - to catch all errors
import expressAsyncHandler from 'express-async-handler';
//models
import Order from '../models/orderModel.js';
// import Product from '../models/productModel.js';
// import User from '../models/userModel.js';
//utils
import { isAuth } from '../utils.js';

const orderRouter = express.Router();

//APIs
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    console.log('req: ', req);
    //NOTE: req.user._id - need to define a middleware (isAuth) to fill the user object of request from the token
    //instantiate an order object
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((orderItem) => ({
        ...orderItem,
        product: orderItem._id,
      })), //QUESTION: is there a block scope here?
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save(); //QUESTION: where does the .save() method come from?
    res
      .status(201)
      .send({ message: 'Status 201 - Created: New Order Created', order });
  })
);


//mine orders - note: must be before '/:id'
orderRouter.get(
  '/mine',
  isAuth, //NOTE: req.user._id will come from isAuth middleware
  expressAsyncHandler( async (req, res) => {
    const orders = await Order.find({user: req.user._id});
    res.send(orders);
  })
)

// post - /api/order/:id
orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler( async (req, res) => {
        console.log("req: ", req);
        //search the database for this order
        const order = await Order.findById(req.params.id);
        //return it to the frontend
        if (order) {
            res.send(order);
        }
        else {
            res.status(404).send({message: 'Status 404 - Order Not Found'});
        }
    })
);

//paypal - update order status after payment
orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler( async (req, res) => {
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

      res.send({message: 'Order Paid', order: updatedOrder});
    } else {
      res.status(404).send({message: 'Order Not Found'});
    }
  })
)



export default orderRouter;
