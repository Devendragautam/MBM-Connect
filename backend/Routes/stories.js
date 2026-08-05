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

// GET /api/stories
router.get("/", authMiddleware, getAllStories);

// POST /api/stories
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }]),
  createStory
);

// DELETE /api/stories/:id
router.delete("/:id", authMiddleware, deleteStory);

// ❤️ Like / Unlike
// POST /api/stories/:id/like
router.post("/:id/like", authMiddleware, toggleLike);

// � Comment
// POST /api/stories/:id/comment
router.post("/:id/comment", authMiddleware, addComment);

export default router;
