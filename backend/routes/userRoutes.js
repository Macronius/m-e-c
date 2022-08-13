//express
import express from 'express';
//express async handler
import expressAsyncHandler from 'express-async-handler';
//bcryptjs
import bcrypt from 'bcryptjs';
//models
import User from '../models/userModel.js';
//utils
import { generateToken, isAuth } from '../utils.js';

const userRouter = express.Router();

//catch the error in the async function and handle in server.js
//sign in api
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    //1st: get user by email
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      //check password
      if (bcrypt.compareSync(req.body.password, user.password)) {
        //send all user information
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        //no reason to continue running the code after sending user data
        return;
      }
    }
    res
      .status(401)
      .send({ message: '401 - Unauthorized: Invalid email or password' });
  })
);

//sign up api
userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    console.log('req from sign-up: ', req);
    //instantiate a new User from the mongoose user model
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    //save user to database QUESTION: where did .save() come from? Mongo? Mongoose?
    const user = await newUser.save();
    //response
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updateUser = await user.save();
      res.send({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        isAdmin: updateUser.isAdmin,
        token: generateToken(updateUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

export default userRouter;
