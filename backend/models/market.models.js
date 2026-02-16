import mongoose from "mongoose";

/* =========================================
   ✅ MARKET ITEM SCHEMA
   ========================================= */
const marketSchema = new mongoose.Schema(
  {
    // User who listed the item
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Category of the item (e.g., Electronics, Books)
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Title of the listing
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed description of the item
    description: {
      type: String,
      trim: true,
    },

    // Price of the item
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Image URL for the item
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Market = mongoose.model("Market", marketSchema);
