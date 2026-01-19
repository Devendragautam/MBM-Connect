import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", (req, res) =>
  res.json({ message: "Protected chat route" })
);

export default router;
