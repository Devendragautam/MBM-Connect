import mongoose from "mongoose";
import { stringify } from "querystring";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
      lowercase: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    password: {
     type : String
    },
    refreshToken: {
      type: String,
    },
    chats: [
      {
        date: { type: String },
        time: { type: String },
        partner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        messages: [
          {
            sender: { type: String },
            receiver: { type: String },
            text: { type: String }, // optional addition for clarity
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
