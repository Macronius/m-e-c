//express
import express from 'express';
//path
import path from 'path';
//mongoose
import mongoose from 'mongoose';
//environmental variable
import dotenv from 'dotenv';
//Routers
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';


//fetch variables in the .env file
dotenv.config();

//connect to the mongodb atlas database
mongoose
    .connect(process.env.MONGODB_URI)
    .then( () => {
        console.log("connected to mongo database")
    })
    .catch( (err) => {
        console.log(err.message);
    });

const app = express();

//convert form data from post request to a json object inside req.body
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//paypal
app.get('/api/keys/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb'); // sb = sandbox
});



app.use('/api/seed', seedRouter); //use to seed an empty cloud(only?) database with data
app.use('/api/upload', uploadRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);


//build middlewares
//get current directory name
const __dirname = path.resolve();
//middleware 1 - serve all files inside frontend build folder as static files
app.use(express.static(path.join(__dirname, '/frontend/build')));
//add route - anything following the website or server name will be served by this .html file
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '/frontend/build/index.html')));
//NOTE: /frontend/build does not exist until npm run build from root folder is executed



//error handler for express
app.use( (err, req, res, next) => {
    res.status(500).send({ message: err.message})
});


//define port
const port = process.env.PORT || 5000;

//start server and be ready to respond to frontend
app.listen(port, () => {
    console.log(`serving at http://localhost:${port}`);
});