import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create a new post
export const createPost = asyncHandler(async (req, res) => {
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    throw new ApiError(400, "Post content is required");
  }

  let imageUrl = null;
  
  // Handle image upload if file is provided
  if (req.file) {
    try {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult) {
        imageUrl = uploadResult.url;
      }
    } catch (error) {
      throw new ApiError(500, "Error uploading image to cloud");
    }
  }

  const post = await Post.create({
    author: req.user._id,
    content: content.trim(),
    image: imageUrl,
  });

  const populatedPost = await post.populate("author", "username avatar fullName");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedPost, "Post created successfully"));
});

// Get all posts (feed)
export const getAllPosts = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          posts,
          totalPosts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
        },
        "Posts retrieved successfully"
      )
    );
});

// Get user's posts
export const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const page = req.query.page || 1;
  const limit = req.query.limit || 9;
  const skip = (page - 1) * limit;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const posts = await Post.find({ author: userId })
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({ author: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          posts,
          totalPosts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
        },
        "User posts retrieved successfully"
      )
    );
});

// Get single post
export const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("author", "username avatar fullName followers following")
    .populate("comments.user", "username avatar");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post, "Post retrieved successfully"));
});

// Update post
export const updatePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check if user is the post author
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own posts");
  }

  // Update content
  if (content && content.trim().length > 0) {
    post.content = content.trim();
  }

  // Handle image update
  if (req.file) {
    try {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult) {
        post.image = uploadResult.url;
      }
    } catch (error) {
      throw new ApiError(500, "Error uploading image to cloud");
    }
  }

  const updatedPost = await post.save();
  const populatedPost = await updatedPost
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, populatedPost, "Post updated successfully"));
});

// Delete post
export const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check if user is the post author
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  await Post.findByIdAndDelete(postId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Post deleted successfully"));
});

// Like/Unlike post
export const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // Unlike post
    post.likes = post.likes.filter(
      (like) => like.toString() !== userId.toString()
    );
  } else {
    // Like post
    post.likes.push(userId);
  }

  const updatedPost = await post.save();
  const populatedPost = await updatedPost
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { post: populatedPost, isLiked: !isLiked },
        isLiked ? "Post unliked successfully" : "Post liked successfully"
      )
    );
});

// Add comment to post
export const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, "Comment text is required");
  }

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = {
    user: req.user._id,
    text: text.trim(),
    createdAt: new Date(),
  };

  post.comments.push(comment);
  const updatedPost = await post.save();
  const populatedPost = await updatedPost
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar");

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedPost, "Comment added successfully")
    );
});

// Delete comment from post
export const deleteComment = asyncHandler(async (req, res) => {
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Check if user is the comment author
  if (comment.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  post.comments.pull(commentId);
  const updatedPost = await post.save();
  const populatedPost = await updatedPost
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, populatedPost, "Comment deleted successfully")
    );
});

// Get user's feed (posts from followed users)
export const getFollowingFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const posts = await Post.find({
    author: { $in: [...user.following, userId] },
  })
    .populate("author", "username avatar fullName")
    .populate("comments.user", "username avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments({
    author: { $in: [...user.following, userId] },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          posts,
          totalPosts,
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
        },
        "Feed retrieved successfully"
      )
    );
});
