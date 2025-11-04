import express from "express";
import { registeruser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Correct: use upload.fields() exactly as your controller expects (req.files.avatar / coverImage)
router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registeruser
);

export default router;
