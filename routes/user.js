import express from "express";
import {
  registeruser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";

import { uploadFields } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/user/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", uploadFields, registeruser);

/**
 * @route   POST /api/user/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/user/logout
 * @desc    Logout user
 * @access  Private
 */
router.post("/logout", authMiddleware, logoutUser);

export default router;
