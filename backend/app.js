import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Route imports
import homeRoutes from "./Routes/home.js";
import authRoutes from "./Routes/auth.js";
import userRoutes from "./Routes/user.js";
import storiesRoutes from "./Routes/stories.js";
import marketRoutes from "./Routes/market.js";
import chatRoutes from "./Routes/chat.js";
import postRoutes from "./Routes/post.js";

import { ApiError } from "./utils/apiError.js";

const app = express();

// Middlewares setup
// Parse cookies from requests
app.use(cookieParser());

// Enable Cross-Origin Resource Sharing (CORS) with credentials
app.use(cors({ origin: true, credentials: true }));

// Parse incoming JSON payloads
app.use(express.json());

// Parse URL-encoded data with extended option (allows nested objects)
app.use(express.urlencoded({ extended: true }));

// Database connection
try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");
} catch (error) {
  console.error("❌ MongoDB connection error:", error.message);
  // Ideally, process should exit or handle retry logic here
}

// Route mounting
// Mount routes to specific paths
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/chat", chatRoutes);

// Error handling

// 404 Handler for undefined routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];

  console.error(`[Error] ${statusCode}: ${message}`);

  // Send formatted error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    // Include stack trace only in development environment
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

import http from "http";
import { initSocket } from "./utils/socket.js";
import { keepAlive } from "./utils/keepAlive.js";

// Health check endpoint for uptime monitors and keep-alive
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Active", timestamp: new Date() });
});

// Server initialization
// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.io with the server
initSocket(server);

// Start listening on the defined port
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);

  // Start self-pinging to prevent sleep on free hosting (if BACKEND_URL isn't set, use localhost for local keeping)
  const serverUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  keepAlive(`${serverUrl}/api/health`, 14);
});
