import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadFields } from "../middlewares/multer.middleware.js";
import { validateRegister, handleValidationErrors } from "../middlewares/validation.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Route: Register new user
// POST /api/auth/register
router.post("/register", uploadFields, validateRegister, asyncHandler(registerUser));

// Route: Login user
// POST /api/auth/login
router.post("/login", asyncHandler(loginUser));

// Route: Refresh access token
// POST /api/auth/refresh-token
router.post("/refresh-token", asyncHandler(refreshAccessToken));

// Route: Logout user
// POST /api/auth/logout
router.post("/logout", authMiddleware, asyncHandler(logoutUser));

// Route: Get current user profile
// GET /api/auth/me
router.get("/me", authMiddleware, asyncHandler(getCurrentUser));

export default router;
