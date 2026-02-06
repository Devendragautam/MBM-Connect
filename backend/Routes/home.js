import express from "express";
import { Post } from "../models/post.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, posts, "Feed fetched successfully"));
}));

export default router;
