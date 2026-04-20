import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";

export const uploadImagesController = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const results = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer)),
    );

    const urls = results.map((r) => r.secure_url);

    return res.status(200).json({
      success: true,
      urls,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
    });
  }
};
