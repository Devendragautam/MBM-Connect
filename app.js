import dotenv from "dotenv";
dotenv.config(); // Load env variables FIRST

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import homeRoutes from "./Routes/home.js";
import storiesRoutes from "./Routes/stories.js";
import chatRoutes from "./Routes/chat.js";
import marketRoutes from "./Routes/market.js";
import userRoutes from "./Routes/user.js"; // ✅ corrected import

const app = express(); // ✅ must come before app.use()

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ handles text fields in form-data

// MongoDB connection
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mbmconnect");
    console.log("✅ MongoDB connection successful");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
main();

// Routes
app.use("/", homeRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/user", userRoutes);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
