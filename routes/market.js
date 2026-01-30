import express from "express";
import {
  createItem,
  getAllItems,
  deleteItem,
} from "../controllers/market.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; // ✅ ADDED

const router = express.Router();

/**
 * @route   GET /api/market
 * @desc    Get all market items
 * @access  Private
 */
router.get("/", authMiddleware, getAllItems);

/**
 * @route   POST /api/market
 * @desc    Create market item
 * @access  Private
 * @note    Supports optional image upload
 */
router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "image", maxCount: 1 }]), // ✅ ADDED
  createItem
);

/**
 * @route   DELETE /api/market/:id
 * @desc    Delete market item
 * @access  Private (owner only)
 */
router.delete("/:id", authMiddleware, deleteItem);

export default router;
