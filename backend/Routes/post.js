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
// GET /api/posts/feed/all
router.get("/feed/all", getAllPosts); // Get all posts

// GET /api/posts/user/:userId
router.get("/user/:userId", getUserPosts); // Get user's posts

// GET /api/posts/:postId
router.get("/:postId", getPostById); // Get single post

// Protected routes (require authentication)
router.use(authMiddleware); // Apply auth middleware to all following routes

// POST /api/posts/create
router.post("/create", upload.single("image"), createPost); // Create post

// GET /api/posts/feed/following
router.get("/feed/following", getFollowingFeed); // Get following user's feed

// PUT /api/posts/:postId
router.put("/:postId", upload.single("image"), updatePost); // Update post

// DELETE /api/posts/:postId
router.delete("/:postId", deletePost); // Delete post

// POST /api/posts/:postId/like
router.post("/:postId/like", toggleLike); // Like/Unlike post

// POST /api/posts/:postId/comment
router.post("/:postId/comment", addComment); // Add comment

// DELETE /api/posts/:postId/comment/:commentId
router.delete("/:postId/comment/:commentId", deleteComment); // Delete comment

export default router;
