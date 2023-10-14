import express from "express";
import expressSession from "express-session";
import mysql from "mysql";
import cors from "cors";
import productsRoute from "./Route/productRoute.js";
import userRoute from "./Route/userRoute.js";
import authRoute from "./Route/authRoute.js"
import authLoginRoute from "./Route/authLoginRoute.js";
import profileRoute from "./Route/profileRoute.js";
import orderRoute from './Route/orderRoute.js';
import orderhistoryRoute from './Route/orderhistoryRoute.js';
import dataRoute from './Route/dataRoute.js';


const app = express();
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json())
app.use(cors());
app.get("/",(req,res)=>{
    res.json("backend")
})

//Routes
app.use("/users", userRoute);
app.use("/products", productsRoute);
app.use("/register", authRoute);
app.use("/login",authLoginRoute);
app.use("/profile",profileRoute);
app.use("/order",orderRoute);
app.use("/orderhistory",orderhistoryRoute);
app.use("/data",dataRoute);



////////////////////////////////////////
app.listen(8000, ()=>{
    console.log("backend working")
})



// const db = mysql.createConnection({
//     host:"localhost",
//     user:"root",
//     password:"",
//     database:"fullstock"
// })