import mongoose from "mongoose";

const MarketSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
    },
    data: {
      category: {
        type: String,
        required: true,
        trim: true,
      },
      date: {
        type: String,
      },
      time: {
        type: String,
      },
      image: { 
        type: String,
      },
      description: { 
        type: String,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

export const Market = mongoose.model("Market", MarketSchema);
