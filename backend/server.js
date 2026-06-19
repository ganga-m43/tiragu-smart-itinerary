import express from 'express';
import cors from 'cors';
import mongoose, { mongo } from "mongoose"
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Route from './Routes/Route.js';
import { clerkMiddleware } from '@clerk/express';

dotenv.config();

let app = express();

// ✅ CORS must be BEFORE clerkMiddleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
})); 

// ✅ Then use clerkMiddleware
app.use(clerkMiddleware({
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

app.use(express.json());
app.use(bodyParser.json()); 


app.use("/api/itinerary",Route);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

let PORT=process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI,)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)});