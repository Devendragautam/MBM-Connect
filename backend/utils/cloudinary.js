import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv"; // ✅ Import dotenv

dotenv.config(); // ✅ Load environment variables before using them

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // Remove local file after successful upload
    fs.unlinkSync(localFilePath);

    console.log("✅ File uploaded to Cloudinary:", response.url);
    return response;
  } catch (error) {
    // Remove temp file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("❌ Cloudinary upload failed:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
