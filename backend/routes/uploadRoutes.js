//server
import express from 'express';
//upload files to cloud server
import {v2 as cloudinary} from 'cloudinary'; // version 2
import streamifier from 'streamifier'; // stream files to cloudinary
import multer from 'multer';
//utility functions
import {isAdmin, isAuth} from '../utils.js';


        

//package to handle uploading files to server
const upload = multer()


const uploadRouter = express.Router();

//generate new record
uploadRouter.post(
    //QUESTION: this whole thing is confusing af
    '/',
    isAuth,
    isAdmin,
    upload.single('file'),
    async (req, res) => {
        //configure cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        //streamUpload
        const streamUpload = req => {
            return new Promise( (resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream( (error, result) => {
                    if (result) {
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        const result = await streamUpload(req);
        res.send(result);
    }
);
export default uploadRouter;