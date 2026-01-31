import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/:id", getUserProfile);
router.put(
  "/:id/profile",
  authMiddleware,
  upload.fields([{ name: "avatar", maxCount: 1 }, { name: "coverImage", maxCount: 1 }]),
  updateUserProfile
);
router.post("/:id/follow", authMiddleware, followUser);
router.post("/:id/unfollow", authMiddleware, unfollowUser);
router.get("/:id/posts", authMiddleware, getUserPosts);

export default router;
