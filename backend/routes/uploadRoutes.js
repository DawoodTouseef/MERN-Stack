import path from "path";
import express from "express";
import multer from "multer";
import fs from "fs";

const router = express.Router();
const __dirname = path.resolve();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
const productsDir = path.join(uploadsDir, "products");

const documentsDir = path.join(uploadsDir, "documents");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
}

if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type;
    if (type === 'document') {
      cb(null, documentsDir);
    } else {
      cb(null, productsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const type = req.query.type;

  if (type === 'document') {
    const filetypes = /jpe?g|png|webp|pdf/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp|application\/pdf/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (filetypes.test(extname) && mimetypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, or PDF files are allowed for documents"), false);
    }
  } else {
    // Default to product images
    const filetypes = /jpe?g|png|webp/;
    const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (filetypes.test(extname) && mimetypes.test(mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, or WEBP images are allowed"), false);
    }
  }
};

// Accept up to 5 images
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  }
}).array("image", 5);

// Upload Route
router.post("/", (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_UNEXPECTED_FILE" || err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ message: "You can upload a maximum of 5 images." });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size too large. Maximum size is 5MB." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image files provided" });
    }

    const type = req.query.type;
    const folder = type === 'document' ? 'documents' : 'products';
    const filePaths = req.files.map((file) => `/uploads/${folder}/${file.filename}`);

    return res.status(200).json({
      message: "Files uploaded successfully",
      images: filePaths, // Keeping 'images' key for backward compatibility
      files: filePaths
    });
  });
});

// Delete Image Route
router.delete("/", (req, res) => {
  const { imagePath } = req.body;

  if (!imagePath) {
    return res.status(400).json({ message: "Image path is required" });
  }

  // Security check: ensure the path is within uploads/products
  if (!imagePath.startsWith("/uploads/products/")) {
    return res.status(400).json({ message: "Invalid image path" });
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