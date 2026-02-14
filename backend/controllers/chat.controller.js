import { Conversation, Message } from "../models/chat.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../utils/socket.js";

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    members: { $in: [req.user._id] },
  })
    .populate("members", "username avatar fullName")
    .sort({ updatedAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, conversations, "Conversations fetched"));
});

export const createConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  if (!receiverId) throw new ApiError(400, "Receiver ID is required");

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    members: { $all: [req.user._id, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      members: [req.user._id, receiverId],
    });
  }

  res
    .status(200)
    .json(new ApiResponse(200, conversation, "Conversation started"));
});

export const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    conversationId: req.params.conversationId,
  }).populate("sender", "username avatar");

  res.status(200).json(new ApiResponse(200, messages, "Messages fetched"));
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { conversationId } = req.params;

  if (!text) throw new ApiError(400, "Message text is required");

  const message = await Message.create({
    conversationId,
    sender: req.user._id,
    text,
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: text,
    updatedAt: Date.now(),
  });

  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "username avatar"
  );

  // ✅ Socket.io: Emit message to all members in the conversation
  const conversation = await Conversation.findById(conversationId);
  const io = getIO();

  if (conversation) {
    conversation.members.forEach((memberId) => {
      // We emit to each user's personal room (joined on connection/login)
      // Event Format: "message:new" (Matches frontend listener)
      io.to(memberId.toString()).emit("message:new", populatedMessage);
    });
  }

  res.status(201).json(new ApiResponse(201, populatedMessage, "Message sent"));
});

export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Allow only sender to delete
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  await message.deleteOne();

  // Socket.io: Emit delete event
  const conversation = await Conversation.findById(message.conversationId);
  const io = getIO();

  if (conversation) {
    conversation.members.forEach((memberId) => {
      io.to(memberId.toString()).emit("message:deleted", messageId);
    });
  }

  res.status(200).json(new ApiResponse(200, {}, "Message deleted"));
});