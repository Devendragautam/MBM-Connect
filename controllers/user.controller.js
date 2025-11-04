import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registeruser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = req.body;

  if (!fullName || !username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  const existeduser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existeduser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath =
    req.files?.coverImage?.[0]?.path || req.files?.coverimage?.[0]?.path;

  if (!avatarLocalpath || !fs.existsSync(avatarLocalpath)) {
    throw new ApiError(400, "Avatar file is missing or invalid path");
  }

  const avatar = await uploadOnCloudinary(avatarLocalpath);
  const coverImage =
    coverImageLocalpath && fs.existsSync(coverImageLocalpath)
      ? await uploadOnCloudinary(coverImageLocalpath)
      : null;

  if (!avatar) {
    throw new ApiError(400, "Error uploading avatar to Cloudinary");
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { user: createdUser }, "User registered successfully"));
});
