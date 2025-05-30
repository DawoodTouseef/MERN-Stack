import path from "path";
import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();
const __dirname = path.resolve();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, or WEBP images are allowed"), false);
  }
};

// Accept up to 5 images
const uploadMultiple = multer({ storage, fileFilter }).array("image", 5);

// Upload Route
router.post("/", (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "You can upload a maximum of 5 images." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const imagePaths = req.files.map((file) => `/uploads/${file.filename}`);
    return res.status(200).json({
      message: "Images uploaded successfully",
      images: imagePaths,
    });
  });
});

// Delete Image Route
router.delete("/", (req, res) => {
  const { imagePath } = req.body;
  
  if (!imagePath) {
    return res.status(400).json({ message: "Image path is required" });
  }

  const imageFullPath = path.join(__dirname, imagePath.replace("/uploads", "uploads"));

  fs.unlink(imageFullPath, (err) => {
    if (err) {
      console.error("Error deleting image:", err);
      return res.status(500).json({ message: "Failed to delete image" });
    }
    return res.status(200).json({ message: "Image deleted successfully" });
  });
});

export default router;
