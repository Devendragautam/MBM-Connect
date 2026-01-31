import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getConversations);
router.post("/", createConversation); // Start new chat
router.get("/:conversationId", getMessages);
router.post("/:conversationId", sendMessage);

export default router;
