import mongoose from "mongoose";
import bcrypt from "bcrypt";

/* =========================================
   ✅ USER SCHEMA
   ========================================= */
const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    },

    coverImage: {
      type: String,
    },

    bio: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: true,
      select: false, // 🔑 IMPORTANT (learning point): Do not return password by default
    },

    refreshToken: {
      type: String,
    },

    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    postsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/**
 * 🔐 Compare entered password with hashed password
 * (You will use this in login controller)
 */
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
