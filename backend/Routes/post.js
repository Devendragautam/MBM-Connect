import express from "express";
import {
  createPost,
  getAllPosts,
  getUserPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getFollowingFeed,
} from "../controllers/post.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public routes
router.get("/feed/all", getAllPosts); // Get all posts
router.get("/user/:userId", getUserPosts); // Get user's posts
router.get("/:postId", getPostById); // Get single post

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all following routes

router.post("/create", upload.single("image"), createPost); // Create post
router.get("/feed/following", getFollowingFeed); // Get following user's feed

router.put("/:postId", upload.single("image"), updatePost); // Update post
router.delete("/:postId", deletePost); // Delete post

router.post("/:postId/like", toggleLike); // Like/Unlike post

router.post("/:postId/comment", addComment); // Add comment
router.delete("/:postId/comment/:commentId", deleteComment); // Delete comment

export default router;
