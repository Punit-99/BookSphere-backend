import express from "express";
import { uploadImagesController } from "../controllers/upload/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteImageController } from "../controllers/upload/delete.controller.js";

const router = express.Router();

router.post(
  "/image",
  upload.array("files", Number(process.env.MAX_FILE_COUNT || 10)),
  uploadImagesController,
);
router.post("/delete", deleteImageController);

export default router;
