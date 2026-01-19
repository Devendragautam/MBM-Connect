import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
  sameSite: "strict",
};

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !username || !password) {
    throw new ApiError(400, "All fields required");
  }

  const exists = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username.toLowerCase() },
    ],
  });

  if (exists) throw new ApiError(409, "User already exists");

  const avatarPath = req.files?.avatar?.[0]?.path;
  if (!avatarPath) throw new ApiError(400, "Avatar required");

  const avatar = await uploadOnCloudinary(avatarPath);
  if (!avatar?.url) throw new ApiError(500, "Avatar upload failed");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    password: hashedPassword,
    avatar: avatar.url,
  });

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
    .status(201)
    .json(new ApiResponse(201, safeUser, "Registered successfully"));
};

/* ================= LOGIN ================= */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password required");
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user) throw new ApiError(401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Login successful"));
};

/* ================= LOGOUT ================= */
export const logoutUser = async (req, res) => {
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
};

/* ================= CURRENT USER ================= */
export const getCurrentUser = async (req, res) => {
  res.json(new ApiResponse(200, req.user, "Current user"));
};

/* ================= REFRESH TOKEN ================= */
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Refresh token expired");
  }

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const newAccessToken = generateAccessToken(user._id);

  res
    .cookie("accessToken", newAccessToken, cookieOptions)
    .json(new ApiResponse(200, {}, "Token refreshed"));
};
