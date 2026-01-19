import express from "express";
import {
  createItem,
  getAllItems,
  deleteItem,
} from "../controllers/market.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

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
 */
router.post("/", authMiddleware, createItem);

/**
 * @route   DELETE /api/market/:id
 * @desc    Delete market item
 * @access  Private (owner only)
 */
router.delete("/:id", authMiddleware, deleteItem);

export default router;
