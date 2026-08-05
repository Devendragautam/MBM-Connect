import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(async (req, res, next) => {
  // 1. Try to get token from cookies first, then from Authorization header
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7); // Remove "Bearer " prefix
    }
  }

  // 2. If no token found, throw Unauthorized error
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;
  try {
    // 3. Verify the token using the secret key
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Map JWT errors to a 401 Unauthorized ApiError
    throw new ApiError(401, err.message || 'Invalid token');
  }

  // 4. Find the user by ID from the decoded token, excluding sensitive fields
  const user = await User.findById(decoded._id).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid token");
  }

  // 5. Attach user object to the request for downstream use
  req.user = user;
  next();
});

