import { validationResult, body, param, query } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

/* ================= VALIDATION ERROR HANDLER ================= */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => `${err.param}: ${err.msg}`)
      .join(", ");
    throw new ApiError(400, errorMessages);
  }
  next();
};

/* ================= REGISTER VALIDATION ================= */
export const validateRegister = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters"),

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3-20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  handleValidationErrors,
];

/* ================= LOGIN VALIDATION ================= */
export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  handleValidationErrors,
];

/* ================= ID VALIDATION ================= */
export const validateUserId = [
  param("userId")
    .isMongoId()
    .withMessage("Invalid user ID format"),

  handleValidationErrors,
];

/* ================= EMAIL VALIDATION ================= */
export const validateEmail = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  handleValidationErrors,
];

/* ================= PASSWORD VALIDATION ================= */
export const validatePassword = [
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  handleValidationErrors,
];
