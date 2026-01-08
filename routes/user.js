import express from "express";
import { registeruser } from "../controllers/user.controller.js";
import { uploadFields } from "../middlewares/multer.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/user/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", uploadFields, registeruser);

// (Next step – login will go here)
// router.post("/login", loginUser);

export default router;
