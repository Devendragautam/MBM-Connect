import express from "express";
const router = express.Router();

/**
 * @route   GET /api/stories
 * @desc    Get all stories
 */
router.get("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Stories feature not implemented yet",
  });
});

/**
 * @route   POST /api/stories
 * @desc    Create a new story
 */
router.post("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Create story not implemented yet",
  });
});

export default router;
