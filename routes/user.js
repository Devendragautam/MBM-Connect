import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

import { uploadFields } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * AUTH ROUTES
 * All authentication logic is handled by auth.controller.js
 */

// Register user (with avatar upload)
router.post("/register", uploadFields, validateRegister, registerUser);

// Login
router.post("/login", validateLogin, loginUser);

// Refresh access token
router.post("/refresh", refreshAccessToken);

// Logout (protected)
router.post("/logout", authMiddleware, logoutUser);

// Get current logged-in user
router.get("/me", authMiddleware, getCurrentUser);

export default router;
