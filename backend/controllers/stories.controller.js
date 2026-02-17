import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * ===============================
 * CREATE STORY (with optional image)
 * ===============================
 */
/**
 * ===============================
 * CREATE STORY
 * Creates a new story, which is essentially a post but treated differently in UI
 * ===============================
 */
export const createStory = asyncHandler(async (req, res) => {
  const { content } = req.body;

  // 1️⃣ Validation
  if (!content) {
    throw new ApiError(400, "Story content is required");
  }

  let imageUrl = "";

  // 2️⃣ Handle optional image upload
  const imagePath = req.files?.image?.[0]?.path;
  if (imagePath) {
    const upload = await uploadOnCloudinary(imagePath);
    imageUrl = upload?.url || "";
  }

  // 3️⃣ Create Story (Post)
  const post = await Post.create({
    author: req.user._id,
    content,
    image: imageUrl,
  });

  res
    .status(201)
    .json(new ApiResponse(201, post, "Story created"));
});

/**
 * ===============================
 * GET ALL STORIES (Feed)
 * ===============================
 */
export const getAllStories = asyncHandler(async (req, res) => {
  const stories = await Post.find()
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username fullName avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, stories, "Stories fetched"));
});

/**
 * ===============================
 * DELETE STORY (Owner only)
 * ===============================
 */
export const deleteStory = asyncHandler(async (req, res) => {
  const story = await Post.findById(req.params.id);

  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  if (story.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed to delete this story");
  }

  await story.deleteOne();

  res.json(new ApiResponse(200, {}, "Story deleted"));
});

/**
 * ===============================
 * LIKE / UNLIKE STORY
 * ===============================
 */
export const toggleLike = asyncHandler(async (req, res) => {
  const story = await Post.findById(req.params.id);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  const userId = req.user._id.toString();
  const isLiked = story.likes.includes(userId);

  if (isLiked) {
    story.likes.pull(userId);
  } else {
    story.likes.push(userId);
  }

  await story.save();

  res.json(
    new ApiResponse(
      200,
      story.likes,
      isLiked ? "Story unliked" : "Story liked"
    )
  );
});

/**
 * ===============================
 * ADD COMMENT TO STORY
 * ===============================
 */
export const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    throw new ApiError(400, "Comment text is required");
  }

  const story = await Post.findById(req.params.id);
  if (!story) {
    throw new ApiError(404, "Story not found");
  }

  story.comments.push({
    user: req.user._id,
    text,
  });

  await story.save();

  // Populate user details for the new comments
  await story.populate("comments.user", "username fullName avatar");

  res.json(
    new ApiResponse(201, story.comments, "Comment added")
  );
});
