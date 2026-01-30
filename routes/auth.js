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
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", uploadFields, asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/refresh-token", asyncHandler(refreshAccessToken));
router.post("/logout", authMiddleware, asyncHandler(logoutUser));
router.get("/me", authMiddleware, asyncHandler(getCurrentUser));

export default router;
