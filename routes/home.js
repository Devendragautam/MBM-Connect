import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MBM Connect API ",
    available_routes: {
      stories: "/api/stories",
      conversations: "/api/chat",
      market: "/api/market",
    },
  });
});

export default router;
