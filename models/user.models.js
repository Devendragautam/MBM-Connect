import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      unique : true
    },
    chats: [
      {
        date: {
          type: String,
        },
        time: {
          type: String,
        },
        partner: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User",
        },
        messages: [ 
          {
            sender: {
              type: String,
            },
            receiver: { 
              type: String,
            }
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
