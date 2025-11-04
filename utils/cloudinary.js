import dotenv from "dotenv";
dotenv.config(); // 👈 Load .env first

import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Debug check (optional, for testing)
console.log("Cloudinary ENV Check:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  API_KEY: process.env.CLOUDINARY_API_KEY ? "✅ Loaded" : "❌ Missing",
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "✅ Loaded" : "❌ Missing",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    fs.unlinkSync(localFilePath);
    console.log("✅ File uploaded to Cloudinary:", response.url);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload failed:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
