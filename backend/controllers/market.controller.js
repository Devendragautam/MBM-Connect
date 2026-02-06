import { Market } from "../models/market.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // ✅ ADDED

/**
 * ===============================
 * CREATE ITEM (UPDATED)
 * - supports optional image upload
 * ===============================
 */
export const createItem = asyncHandler(async (req, res) => {
  const { title, price, category, description } = req.body;

  // ❌ Validation
  if (!title || !price || !category) {
    throw new ApiError(400, "Title, price, and category are required");
  }

  // ✅ NEW: handle image upload (optional)
  let imageUrl = "";
  const imagePath = req.files?.image?.[0]?.path;

  if (imagePath) {
    const uploadResult = await uploadOnCloudinary(imagePath);
    if (!uploadResult?.url) {
      throw new ApiError(500, "Market image upload failed");
    }
    imageUrl = uploadResult.url;
  }

  // ✅ Create market item
  const item = await Market.create({
    owner: req.user._id,
    title,
    price,
    category,
    description,
    image: imageUrl, // ✅ NEW FIELD
  });

  res
    .status(201)
    .json(new ApiResponse(201, item, "Item created successfully"));
});

/**
 * ===============================
 * GET ALL ITEMS
 * ===============================
 */
export const getAllItems = asyncHandler(async (req, res) => {
  const items = await Market.find()
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, items, "Market items fetched"));
});

/**
 * ===============================
 * DELETE ITEM (OWNER ONLY)
 * ===============================
 */
export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Market.findById(req.params.id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // 🔐 Authorization check
  if (item.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this item");
  }

  await item.deleteOne();

  res.json(new ApiResponse(200, {}, "Item deleted successfully"));
});
