import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/* ================= GET USER PROFILE ================= */
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -refreshToken")
    .populate("followers", "username avatar")
    .populate("following", "username avatar");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, user, "User profile fetched successfully")
  );
});

/* ================= UPDATE PROFILE ================= */
export const updateUserProfile = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  const isOwner = req.user._id.toString() === req.params.id;

  const { fullName, bio, website } = req.body;
  const updateData = {};

  // Owners can update profile fields; others may only update avatar/cover images
  if (isOwner) {
    if (fullName) updateData.fullName = fullName;
    if (bio) updateData.bio = bio;
    if (website) updateData.website = website;
  } else {
    // If not owner, ensure request contains at least one allowed file
    if (!req.files?.avatar?.[0] && !req.files?.coverImage?.[0]) {
      throw new ApiError(403, "You can only update your own profile");
    }
  }

  if (req.files?.avatar?.[0]) {
    const avatar = await uploadOnCloudinary(req.files.avatar[0].path);
    if (!avatar?.url) {
      throw new ApiError(500, "Avatar upload failed");
    }
    updateData.avatar = avatar.url;
  }

  if (req.files?.coverImage?.[0]) {
    const cover = await uploadOnCloudinary(req.files.coverImage[0].path);
    if (!cover?.url) {
      throw new ApiError(500, "Cover image upload failed");
    }
    updateData.coverImage = cover.url;
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No data provided to update");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true }
  )
    .select("-password -refreshToken")
    .populate("followers", "username avatar")
    .populate("following", "username avatar");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, updatedUser, "User profile updated successfully")
  );
});

/* ================= FOLLOW USER ================= */
export const followUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  if (targetUserId === currentUserId.toString()) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentUser = await User.findById(currentUserId).session(session);
    const targetUser = await User.findById(targetUserId).session(session);

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (
      currentUser.following.some(
        (id) => id.toString() === targetUserId
      )
    ) {
      throw new ApiError(400, "Already following this user");
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save({ session });
    await targetUser.save({ session });

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(200, {}, "User followed successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/* ================= UNFOLLOW USER ================= */
export const unfollowUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  const targetUserId = req.params.id;
  const currentUserId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentUser = await User.findById(currentUserId).session(session);
    const targetUser = await User.findById(targetUserId).session(session);

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (
      !currentUser.following.some(
        (id) => id.toString() === targetUserId
      )
    ) {
      throw new ApiError(400, "Not following this user");
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save({ session });
    await targetUser.save({ session });

    await session.commitTransaction();

    res.status(200).json(
      new ApiResponse(200, {}, "User unfollowed successfully")
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/* ================= USER POSTS ================= */
export const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({ author: req.params.id })
    .populate("author", "username avatar")
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, posts, "User posts fetched successfully")
  );
});

/* ================= GET ALL USERS ================= */
export const getAllUsers = asyncHandler(async (req, res) => {
  // Return list of all registered users (limited public fields)
  const users = await User.find()
    .select('fullName username avatar email')
    .sort({ fullName: 1 });

  res.status(200).json(
    new ApiResponse(200, users, 'All users fetched successfully')
  );
});
