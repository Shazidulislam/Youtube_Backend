import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// create app
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" })); // json data
app.use(urlencoded({ extended: true, limit: "16kb" })); //
app.use(express.static("public")) //image or pdf asset emon kono file thabo

app.use(cookieParser()) // use case for store cookie from client as objectF



// routes import
import userRouter from "./routes/user.routes.js"; 


// routes declaration 
app.use("/api/v1/users", userRouter);

// http://localhost:4000/api/v1/users/register





export default app;
