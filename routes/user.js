import express from "express";
import {
  registeruser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshToken,
} from "../controllers/user.controller.js";

import { uploadFields } from "../middlewares/multer.middleware.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", uploadFields, registeruser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/refresh", refreshToken);

export default router;
