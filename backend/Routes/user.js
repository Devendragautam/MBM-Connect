import express from "express";
import {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Public: list all users
// GET /api/user
router.get("/", getAllUsers);

// GET /api/user/:id
router.get("/:id", getUserProfile);

// PUT /api/user/:id/profile
router.put(
  "/:id/profile",
  authMiddleware,
  upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
  updateUserProfile
);

// POST /api/user/:id/follow
router.post("/:id/follow", authMiddleware, followUser);

// POST /api/user/:id/unfollow
router.post("/:id/unfollow", authMiddleware, unfollowUser);

// GET /api/user/:id/posts
router.get("/:id/posts", authMiddleware, getUserPosts);

export default router;
