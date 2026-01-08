import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Chat system coming soon",
  });
});

export default router;
