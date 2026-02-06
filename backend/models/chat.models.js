import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
export const Message = mongoose.model("Message", messageSchema);