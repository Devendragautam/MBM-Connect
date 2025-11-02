import express from "express";
import mongoose from "mongoose";

import homeRoutes from "./Routes/home.js";
import storiesRoutes from "./Routes/chat.js";
import chatRoutes from "./Routes/chat.js";
import marketRoutes from "./Routes/market.js";
import userRoutes from "./Routes/user.js";

const app = express();
app.use(express.json());

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/mbmconnect");
  console.log("MongoDB connection successful");
}
main().catch((err) => console.log(" MongoDB connection error:", err));

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

app.use("/", homeRoutes);
app.use("/api/stories", storiesRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/user", userRoutes);
