import bcrypt from "bcrypt";
import fs from "fs/promises";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

export const registeruser = async (req, res) => {
  const safeUnlink = async (path) => {
    if (!path) return;
    try {
      await fs.unlink(path);
    } catch (e) {}
  };

  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);

    const { fullName, email, username, password } = req.body ?? {};

    if (
      !fullName ||
      !email ||
      !username ||
      !password ||
      !String(fullName).trim() ||
      !String(email).trim() ||
      !String(username).trim() ||
      !String(password).trim()
    ) {
      throw new ApiError(400, "All fields (fullName, email, username, password) are required");
    }

    const emailNormalized = String(email).trim().toLowerCase();
    const usernameNormalized = String(username).trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalized)) {
      throw new ApiError(400, "Invalid email format");
    }

    const existedUser = await User.findOne({
      $or: [{ username: usernameNormalized }, { email: emailNormalized }],
    });

    if (existedUser) {
      throw new ApiError(409, "User with that email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarUpload?.url) {
      await safeUnlink(avatarLocalPath);
      await safeUnlink(coverImageLocalPath);
      throw new ApiError(400, "Avatar upload failed");
    }

    let coverImageUrl = "";
    if (coverImageLocalPath) {
      const coverUpload = await uploadOnCloudinary(coverImageLocalPath);
      if (coverUpload?.url) coverImageUrl = coverUpload.url;
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      fullName: String(fullName).trim(),
      avatar: avatarUpload.url,
      coverImage: coverImageUrl,
      email: emailNormalized,
      password: hashedPassword,
      username: usernameNormalized,
    });

    await safeUnlink(avatarLocalPath);
    await safeUnlink(coverImageLocalPath);

    const createdUser = await User.findById(user._id).select("-password -refreshToken -__v");

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    return res.status(error?.statusCode || 500).json({
      status: false,
      message: error?.message || "Internal Server Error",
    });
  }
};
