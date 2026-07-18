import express, { Router } from "express";
import { uploadImagesController } from "../controllers/upload/upload.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteImageController } from "../controllers/upload/delete.controller.js";

const router: Router = express.Router();

router.post(
  "/image",
  upload.array("files", Number(process.env.MAX_FILE_COUNT || 10)),
  uploadImagesController as any,
);
router.post("/delete", deleteImageController as any);

export default router;
