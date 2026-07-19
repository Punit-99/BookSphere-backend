import { Request, Response } from "express";
import cloudinary from "../../utils/cloudinary";

export const deleteImageController = async (req: Request, res: Response): Promise<any> => {
  try {
    const publicId = req.body.publicId || req.body.public_id;

    if (!publicId) {
      return res.status(400).json({ message: "publicId required" });
    }

    await cloudinary.uploader.destroy(publicId);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "delete failed" });
  }
};
