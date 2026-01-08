import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registeruser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // 1️⃣ Basic validation
  if (![fullName, email, username, password].every(Boolean)) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters long");
  }

  const emailNormalized = email.trim().toLowerCase();
  const usernameNormalized = username.trim().toLowerCase();

  // 2️⃣ Email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailNormalized)) {
    throw new ApiError(400, "Invalid email format");
  }

  // 3️⃣ Check existing user
  const existedUser = await User.findOne({
    $or: [{ email: emailNormalized }, { username: usernameNormalized }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with that email or username already exists");
  }

  // 4️⃣ Avatar validation
  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // 5️⃣ Upload avatar
  const avatarUpload = await uploadOnCloudinary(avatarPath);
  if (!avatarUpload?.url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // 6️⃣ Upload cover image (optional)
  let coverImageUrl = "";
  const coverPath = req.files?.coverImage?.[0]?.path;

  if (coverPath) {
    const coverUpload = await uploadOnCloudinary(coverPath);
    coverImageUrl = coverUpload?.url || "";
  }

  // 7️⃣ Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 8️⃣ Create user
  const user = await User.create({
    fullName: fullName.trim(),
    email: emailNormalized,
    username: usernameNormalized,
    password: hashedPassword,
    avatar: avatarUpload.url,
    coverImage: coverImageUrl,
  });

  // 9️⃣ Send safe response
  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken -__v"
  );

  res
    .status(201)
    .json(new ApiResponse(201, safeUser, "User registered successfully"));
});
