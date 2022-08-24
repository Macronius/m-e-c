//express
import express from 'express';
//express async handler
import expressAsyncHandler from 'express-async-handler';
//bcryptjs
import bcrypt from 'bcryptjs';
//models
import User from '../models/userModel.js';
//utils
import { generateToken, isAuth, isAdmin } from '../utils.js';

const userRouter = express.Router();

// /api/users/
userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler( async (req, res) => {
    const users = await User.find({});  // get all users
    res.send(users);  // send users to frontend
  })
);

// /api/users/:id
userRouter.get(
  '/:id',
  isAuth, 
  isAdmin,
  expressAsyncHandler( async (req, res) => {
    console.log("req from /api/users/:id", req);
    console.log("res from /api/users/:id", res);
    //get current user from database
    const user = await User.findById(req.params.id); //QUESTION: how did id-payload get there?
    if (user) {
      res.send(user);
    }
    else {
      res.status(404).send({message: "User not found"});
    }
  })
)
// /api/users/:id - update
userRouter.put(
  '/:id',
  isAuth, 
  isAdmin,
  expressAsyncHandler( async (req, res) => {
    //get user from database
    const user = await User.findById(req.params.id); //select a working instance of user
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({message: 'User Updated', user: updatedUser});
    }
    else {
      res.status(404).send({message: "User not found"});
    }
  })
)
// /api/users/:id - delete
userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler( async (req, res) => {
    const user = await User.findById(req.params.id);
    console.log("user: ", user);
    if (user) {
      if (user.email === 'user@email.com') {
        res.status(400).send({message: 'Cannot delete an admin user'});
        return;
      }
      await user.remove();
      res.send({message: 'User successfully deleted'});
    } else {
      res.status(404).send({message: "User not found"});
    }
  })
);

// /api/users/signin
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    //1st: get user by email
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      //check password
      if (bcrypt.compareSync(req.body.password, user.password)) {
        
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        }); //send all user information
        return; //no reason to continue running the code after sending user data
      }
    }
    res
      .status(401)
      .send({ message: '401 - Unauthorized: Invalid email or password' });
  })
);

// /api/users/signup
userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    // console.log('req from sign-up: ', req);
    //instantiate a new User from the mongoose user model
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    //save user to database QUESTION: where did .save() come from? Mongo? Mongoose?
    const user = await newUser.save();
    //send user information to frontend
    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

// /api/users/profile
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
