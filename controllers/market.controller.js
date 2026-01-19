import { Market } from "../models/market.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * CREATE ITEM
 */
export const createItem = async (req, res) => {
  const { title, price, category, description } = req.body;

  if (!title || !price || !category) {
    throw new ApiError(400, "Title, price, and category are required");
  }

  const item = await Market.create({
    owner: req.user._id,
    title,
    price,
    category,
    description,
  });

  res
    .status(201)
    .json(new ApiResponse(201, item, "Item created"));
};

/**
 * GET ALL ITEMS
 */
export const getAllItems = async (req, res) => {
  const items = await Market.find()
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, items, "Market items fetched"));
};

/**
 * DELETE ITEM
 */
export const deleteItem = async (req, res) => {
  const item = await Market.findById(req.params.id);

  if (!item) throw new ApiError(404, "Item not found");

  if (item.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  await item.deleteOne();

  res.json(new ApiResponse(200, {}, "Item deleted"));
};
