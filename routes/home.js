import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to MBM Connect API",
    routes: {
      user: "/api/user",
      stories: "/api/stories",
      market: "/api/market",
      chat: "/api/chat",
    },
  });
});

export default router;
