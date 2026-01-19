import express from "express";
import {
  createStory,
  getAllStories,
  deleteStory,
  toggleLike,
  addComment,
} from "../controllers/stories.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getAllStories);

router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createStory
);

router.delete("/:id", authMiddleware, deleteStory);

// ❤️ Like / Unlike
router.post("/:id/like", authMiddleware, toggleLike);

// 💬 Comment
router.post("/:id/comment", authMiddleware, addComment);

export default router;
