import cloudinary from "../../utils/cloudinary.js";


export const deleteImageController = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({ message: "public_id required" });
    }

    await cloudinary.uploader.destroy(public_id);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "delete failed" });
  }
};