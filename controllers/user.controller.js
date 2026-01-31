import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshToken")
    .populate("followers", "username avatar")
    .populate("following", "username avatar");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  // Ensure user is updating their own profile
  if (req.user?._id.toString() !== req.params.id) {
    throw new ApiError(403, "Unauthorized request");
  }

  const { fullName, bio, website } = req.body;
  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (bio) updateData.bio = bio;
  if (website) updateData.website = website;

  // Handle avatar upload if present
  if (req.files?.avatar?.[0]) {
    const avatarLocalPath = req.files.avatar[0].path;
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (avatar?.url) {
      updateData.avatar = avatar.url;
    }
  }

  // Handle coverImage upload if present
  if (req.files?.coverImage?.[0]) {
    const coverLocalPath = req.files.coverImage[0].path;
    const cover = await uploadOnCloudinary(coverLocalPath);
    if (cover?.url) {
      updateData.coverImage = cover.url;
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  )
    .select("-password -refreshToken")
    .populate("followers", "username avatar")
    .populate("following", "username avatar");

  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});

export const followUser = asyncHandler(async (req, res) => {
  const userIdToFollow = req.params.id;
  const currentUserId = req.user._id;

  if (userIdToFollow === currentUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const userToFollow = await User.findById(userIdToFollow);
  const currentUser = await User.findById(currentUserId);

  if (!userToFollow) {
    throw new ApiError(404, "User not found");
  }

  // Check if already following
  if (currentUser.following.includes(userIdToFollow)) {
    throw new ApiError(400, "Already following this user");
  }

  // Add to current user's following list
  currentUser.following.push(userIdToFollow);
  await currentUser.save();

  // Add to user's followers list
  userToFollow.followers.push(currentUserId);
  await userToFollow.save();

  res
    .status(200)
    .json(new ApiResponse(200, { currentUser, userToFollow }, "User followed successfully"));
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const userIdToUnfollow = req.params.id;
  const currentUserId = req.user._id;

  const userToUnfollow = await User.findById(userIdToUnfollow);
  const currentUser = await User.findById(currentUserId);

  if (!userToUnfollow) {
    throw new ApiError(404, "User not found");
  }

  // Check if following
  if (!currentUser.following.includes(userIdToUnfollow)) {
    throw new ApiError(400, "Not following this user");
  }

  // Remove from current user's following list
  currentUser.following = currentUser.following.filter(
    (id) => id.toString() !== userIdToUnfollow
  );
  await currentUser.save();

  // Remove from user's followers list
  userToUnfollow.followers = userToUnfollow.followers.filter(
    (id) => id.toString() !== currentUserId.toString()
  );
  await userToUnfollow.save();

  res
    .status(200)
    .json(new ApiResponse(200, { currentUser, userToUnfollow }, "User unfollowed successfully"));
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json(new ApiResponse(200, posts, "User posts fetched successfully"));
});