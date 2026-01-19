import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import homeRoutes from "./Routes/home.js";
import userRoutes from "./Routes/user.js";
import storiesRoutes from "./Routes/stories.js";
import marketRoutes from "./Routes/market.js";
import chatRoutes from "./Routes/chat.js";

import { ApiError } from "./utils/ApiError.js";

const app = express();

/* ✅ Middlewares */
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ DB */
await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ MongoDB connected");

/* ✅ Routes */
app.use("/", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/chat", chatRoutes);

/* ✅ 404 handler (FIXED) */
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

/* ✅ Global error handler */
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ✅ Start server */
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.PORT}`);
});
