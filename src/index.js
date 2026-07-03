import dotenv from "dotenv"
import connectDb from "./db/db.js"

dotenv.config({
  path:"./env"
})



connectDb()


























/*
import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import { DB_NAME } from "./constants.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    // app.on("error", (error) => {
    //   console.log("Error", error);
    //   throw error;
    // });

    // app.listen(process.env.PORT , ()=>{
    //     console.log(`App runing on port ${process.env.PORT}`)
    // })
  } catch (error) {
    console.error(error);
  }
})();

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

server.on("error", (error) => {
  console.log("Error", error);
  throw error;
});
*/