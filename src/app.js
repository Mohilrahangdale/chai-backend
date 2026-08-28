import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit :"16kb"}))//read data or understand it jo bheja gya
app.use(express.urlencoded({extended:true, limit:"16kb"}))//jb data url se aata hai tb ye kaam aata hai
app.use(express.static("public"))//basically jb file s vagere aayengi tb store krane ke kaam aata hai
app.use(cookieParser())


export { app }