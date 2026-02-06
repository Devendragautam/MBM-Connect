import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

/* ================= TOKEN HELPERS ================= */
const generateAccessToken = (id) =>
  jwt.sign({ _id: id }, process.env.JWT_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (id) =>
  jwt.sign({ _id: id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

/* ================= COOKIE OPTIONS ================= */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

/* ================= REGISTER ================= */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username.toLowerCase() },
    ],
  });

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatarUpload = await uploadOnCloudinary(avatarPath);
  if (!avatarUpload?.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  let coverImageUrl = "";
  if (req.files?.coverImage?.[0]?.path) {
    const coverUpload = await uploadOnCloudinary(req.files.coverImage[0].path);
    if (coverUpload?.url) coverImageUrl = coverUpload.url;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: hashedPassword,
    avatar: avatarUpload.url,
    coverImage: coverImageUrl,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // ✅ FIXED RESPONSE (token + user)
  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          token: accessToken,
          user: safeUser,
        },
        "Registered successfully"
      )
    );
});

/* ================= LOGIN ================= */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  const safeUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { token: accessToken, user: safeUser },
        "Login successful"
      )
    );
});

/* ================= LOGOUT ================= */
export const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

/* ================= CURRENT USER ================= */
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, req.user, "Current user fetched"));
});

/* ================= REFRESH TOKEN ================= */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id);

  res
    .cookie("accessToken", newAccessToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Access token refreshed"));
});
