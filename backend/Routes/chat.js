import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteMessage,
  getIceServers,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Get ICE servers (STUN/TURN)
// GET /api/chat/ice-servers
router.get("/ice-servers", getIceServers);

router.use(authMiddleware);

// Get all conversations for the user
// GET /api/chat
router.get("/", getConversations);

// Start a new conversation
// POST /api/chat
router.post("/", createConversation);

// Get messages for a specific conversation
// GET /api/chat/:conversationId
router.get("/:conversationId", getMessages);

// Send a message in a conversation
// POST /api/chat/:conversationId
router.post("/:conversationId", sendMessage);

// Delete a specific message
// DELETE /api/chat/message/:messageId
router.delete("/message/:messageId", deleteMessage);

export default router;
