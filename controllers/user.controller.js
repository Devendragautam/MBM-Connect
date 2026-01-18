import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

/**
 * ===============================
 * REGISTER USER
 * ===============================
 */
export const registeruser = async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    if (!fullName || !email || !username || !password) {
      throw new ApiError(400, "All fields are required");
    }

    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters");
    }

    const emailNormalized = email.trim().toLowerCase();
    const usernameNormalized = username.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email: emailNormalized }, { username: usernameNormalized }],
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    const avatarPath = req.files?.avatar?.[0]?.path;
    if (!avatarPath) {
      throw new ApiError(400, "Avatar image is required");
    }

    const avatarUpload = await uploadOnCloudinary(avatarPath);
    if (!avatarUpload?.url) {
      throw new ApiError(400, "Avatar upload failed");
    }

    let coverImageUrl = "";
    const coverImagePath = req.files?.coverImage?.[0]?.path;

    if (coverImagePath) {
      const coverUpload = await uploadOnCloudinary(coverImagePath);
      coverImageUrl = coverUpload?.url || "";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName: fullName.trim(),
      email: emailNormalized,
      username: usernameNormalized,
      password: hashedPassword,
      avatar: avatarUpload.url,
      coverImage: coverImageUrl,
    });

    const accessToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken -__v"
    );

    return res
      .status(201)
      .cookie("token", accessToken, {
        httpOnly: true,
        secure: false, // set true in production
      })
      .json(new ApiResponse(201, safeUser, "User registered successfully"));
  } catch (error) {
    throw new ApiError(error.statusCode || 500, error.message);
  }
};

/**
 * ===============================
 * LOGIN USER
 * ===============================
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign(
    { _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken -__v"
  );

  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
    })
    .json(new ApiResponse(200, safeUser, "Login successful"));
};

/**
 * ===============================
 * LOGOUT USER
 * ===============================
 */
export const logoutUser = async (req, res) => {
  return res
    .status(200)
    .clearCookie("token")
    .json(new ApiResponse(200, {}, "Logout successful"));
};
