import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import homeRoutes from "./Routes/home.js";
import authRoutes from "./Routes/auth.js";
import userRoutes from "./Routes/user.js";
import storiesRoutes from "./Routes/stories.js";
import marketRoutes from "./Routes/market.js";
import chatRoutes from "./Routes/chat.js";
import postRoutes from "./Routes/post.js";

import { ApiError } from "./utils/apiError.js";

const app = express();

/* ✅ Middlewares */
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ✅ DB */
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");
} catch (error) {
  console.error("❌ MongoDB connection error:", error.message);
}

/* ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/chat", chatRoutes);

/* ✅ 404 handler */
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

/* ✅ Global error handler (catches all async errors) */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  console.error(`[Error] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

import http from "http";
import { initSocket } from "./utils/socket.js";

/* ✅ Start server */
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on ${process.env.PORT}`);
});
