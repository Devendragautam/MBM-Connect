import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import homeRoutes from "./Routes/home.js";
import storiesRoutes from "./Routes/stories.js";
import chatRoutes from "./Routes/chat.js";
import marketRoutes from "./Routes/market.js";
import userRoutes from "./Routes/user.js";

import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
await mongoose.connect(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbmconnect"
);
console.log("✅ MongoDB connected");

// Routes
app.use("/", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/chat", chatRoutes);

// 404
app.all("*", (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
