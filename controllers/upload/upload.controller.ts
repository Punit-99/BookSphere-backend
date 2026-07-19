import { Request, Response } from "express";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

export const uploadImagesController = async (req: Request, res: Response): Promise<any> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const results = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer)),
    );

    const urls = results.map((r: any) => r.secure_url);

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
