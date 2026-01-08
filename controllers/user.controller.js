import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

/**
 * @desc    Register new user
 * @route   POST /api/user/register
 * @access  Public
 */
export const registeruser = async (req, res) => {
  try {
    // 1️⃣ Extract data from request body
    const { fullName, email, username, password } = req.body;

    // 2️⃣ Basic validation
    if (!fullName || !email || !username || !password) {
      throw new ApiError(
        400,
        "fullName, email, username and password are required"
      );
    }

    if (password.length < 6) {
      throw new ApiError(400, "Password must be at least 6 characters long");
    }

    // 3️⃣ Normalize inputs
    const emailNormalized = email.trim().toLowerCase();
    const usernameNormalized = username.trim().toLowerCase();

    // 4️⃣ Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      throw new ApiError(400, "Invalid email format");
    }

    // 5️⃣ Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: emailNormalized }, { username: usernameNormalized }],
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "User with this email or username already exists"
      );
    }

    // 6️⃣ Avatar validation (comes from multer)
    const avatarPath = req.files?.avatar?.[0]?.path;
    if (!avatarPath) {
      throw new ApiError(400, "Avatar image is required");
    }

    // 7️⃣ Upload avatar to Cloudinary
    const avatarUpload = await uploadOnCloudinary(avatarPath);
    if (!avatarUpload?.url) {
      throw new ApiError(400, "Avatar upload failed");
    }

    // 8️⃣ Upload cover image (optional)
    let coverImageUrl = "";
    const coverImagePath = req.files?.coverImage?.[0]?.path;

    if (coverImagePath) {
      const coverUpload = await uploadOnCloudinary(coverImagePath);
      coverImageUrl = coverUpload?.url || "";
    }

    // 9️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔟 Create user in database
    const user = await User.create({
      fullName: fullName.trim(),
      email: emailNormalized,
      username: usernameNormalized,
      password: hashedPassword,
      avatar: avatarUpload.url,
      coverImage: coverImageUrl,
    });

    // 1️⃣1️⃣ Remove sensitive fields before sending response
    const safeUser = await User.findById(user._id).select(
      "-password -refreshToken -__v"
    );

    // 1️⃣2️⃣ Send success response
    return res
      .status(201)
      .json(
        new ApiResponse(201, safeUser, "User registered successfully")
      );
  } catch (error) {
    // Learning-friendly error response
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
