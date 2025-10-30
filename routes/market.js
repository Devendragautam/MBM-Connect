import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "All marketplace items appear here !!" });
});

router.post("/", (req, res) => {
  res.json({ message: "New item listed for sale!" });
});

export default router;
