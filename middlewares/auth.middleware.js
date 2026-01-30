import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new ApiError(401, "Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select("-password -refreshToken");

    if (!user) throw new ApiError(401, "Invalid token");

    req.user = user;
    next();
  } catch (err) {
    next(new ApiError(401, "Invalid or expired token"));
  }
};
