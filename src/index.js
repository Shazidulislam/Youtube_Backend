import dotenv from "dotenv";
import connectDb from "./db/db.js";
import app from "./app.js";
dotenv.config({
  path: "./env",
});
const PORT = process.env.PORT || 3000;

// connect db
const startServer = async () => {
  try {
    await connectDb();

    app.get("/" , (req , res)=>{
      res.send("Hello devs")
    })

    const server = app.listen(PORT , ()=>{
      console.log(`SERVER RUNING ON PORT ${PORT}`)
    })

    server.on("error" ,(error)=>{
      console.log("Server Error", error)
    })

  } catch (error) {
    console.error("Faild to start server", error);
    process.exit(1);
  }
};

startServer();
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
