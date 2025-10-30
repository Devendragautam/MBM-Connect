import express from "express";
const router = express.Router();


router.get("/", (req, res) => {
  res.json({ message: "All campus stories appear here !!" });
});

router.post("/", (req, res) => {
  res.json({ message: "New story added successfully !!!" });
});

export default router;
