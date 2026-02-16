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
/**
 * ===============================
 * CREATE ITEM
 * Creates a new market listing with optional image
 * ===============================
 */
export const createItem = asyncHandler(async (req, res) => {
  const { title, price, category, description } = req.body;

  // 1️⃣ Validation: Check required fields
  if (!title || !price || !category) {
    throw new ApiError(400, "Title, price, and category are required");
  }

  // 2️⃣ Handle optional image upload
  let imageUrl = "";
  const imagePath = req.files?.image?.[0]?.path;

  if (imagePath) {
    const uploadResult = await uploadOnCloudinary(imagePath);
    if (!uploadResult?.url) {
      throw new ApiError(500, "Market image upload failed");
    }
    imageUrl = uploadResult.url;
  }

  // 3️⃣ Create market item in DB
  const item = await Market.create({
    owner: req.user._id,
    title,
    price,
    category,
    description,
    image: imageUrl,
  });

  res
    .status(201)
    .json(new ApiResponse(201, item, "Item created successfully"));
});

/**
 * ===============================
 * UPDATE ITEM (OWNER ONLY)
 * ===============================
 */
export const updateItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, price, category, description } = req.body;

  const item = await Market.findById(id);

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  if (item.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this item");
  }

  let imageUrl = item.image;
  if (req.files?.image?.[0]?.path) {
    const uploadResult = await uploadOnCloudinary(req.files.image[0].path);
    if (uploadResult?.url) {
      imageUrl = uploadResult.url;
    }
  }

  item.title = title || item.title;
  item.price = price || item.price;
  item.category = category || item.category;
  item.description = description || item.description;
  item.image = imageUrl;

  await item.save();

  res.json(new ApiResponse(200, item, "Item updated successfully"));
});

/**
 * ===============================
 * GET ALL ITEMS
 * ===============================
 */
export const getAllItems = asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, search, category, minPrice, maxPrice } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const items = await Market.find(query)
    .populate("owner", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Market.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      listings: items,
      totalListings: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    }, "Market items fetched")
  );
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
