import mongoose from "mongoose";

// Post schema
const postSchema = new mongoose.Schema(
  {
    // User who created the post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text content of the post
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // Optional image URL for the post
    image: {
      type: String,
    },

    // Array of users who liked the post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Array of comments on the post
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", postSchema);
