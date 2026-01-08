import express from "express";
const router = express.Router();

/**
 * @route   GET /api/market
 */
router.get("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Marketplace not implemented yet",
  });
});

/**
 * @route   POST /api/market
 */
router.post("/", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Add item not implemented yet",
  });
});

export default router;
