import dotenv from "dotenv";
dotenv.config(); // 1️⃣ Load env variables first

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

// 2️⃣ Global middlewares
app.use(
  cors({
    origin: "*", // learning mode (allow all)
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3️⃣ MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbmconnect"
    );
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
connectDB();

// 4️⃣ Routes
app.use("/", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/chat", chatRoutes);

// 5️⃣ Handle unknown routes (404)
app.all("*", (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

// 6️⃣ Global error handler (learning-friendly)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 7️⃣ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
