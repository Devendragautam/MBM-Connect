import multer from "multer";
import fs from "fs";
import path from "path";
import { ApiError } from "../utils/apiError.js";

// 1️⃣ Define temp directory for uploads
const tempDir = path.join(process.cwd(), "public", "temp");

// 2️⃣ Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 3️⃣ Sanitize file names (avoid spaces & special chars)
const sanitizeFileName = (name) => {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_");
};

// 4️⃣ Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // where file will be stored temporarily
    cb(null, tempDir);
  },

  filename: (req, file, cb) => {
    // how file name will look
    const safeName = sanitizeFileName(file.originalname);
    cb(null, `${Date.now()}-${safeName}`);
  },
});

// 5️⃣ File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    // this error will be caught by error middleware later
    return cb(
      new ApiError(
        400,
        "Only image files (jpeg, png, jpg, webp) are allowed"
      )
    );
  }

  cb(null, true);
};

// 6️⃣ Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB
  },
});

// 7️⃣ Export helper for multiple fields
export const uploadFields = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);
