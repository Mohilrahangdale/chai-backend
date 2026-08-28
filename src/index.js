//require('dotenv').config({ path: '/chaivalaback/chaiBackend/.env' })
import dotenv from "dotenv"

// import mongoose from "mongoose";//first vale case me kiya tha 
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import { app } from "./app.js";


dotenv.config({
    path: '/chaivalaback/chaiBackend/.env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(` Server is listenning on port : ${process.env.PORT}`);

    })
})
.catch((err)=>{
    console.log("MONGODB connecctionn failed !!!!!",err);
    
})









/*
import express from "express"
const app = express()


( async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR: ",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.log("ERROR: ",error)
        throw err
    }
})()
    */