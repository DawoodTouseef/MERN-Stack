import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Allowed file types
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt'
};

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/products',
    'uploads/users',
    'uploads/categories',
    'uploads/brands',
    'uploads/documents'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Generate secure filename
const generateSecureFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname).toLowerCase();
  return `${timestamp}-${randomString}${extension}`;
};

// File filter function
const createFileFilter = (allowedTypes, maxSize) => {
  return (req, file, cb) => {
    // Check file type
    if (!allowedTypes[file.mimetype]) {
      return cb(new Error(`Invalid file type. Allowed types: ${Object.keys(allowedTypes).join(', ')}`), false);
    }
    
    // Additional security checks
    const extension = path.extname(file.originalname).toLowerCase();
    const expectedExtension = allowedTypes[file.mimetype];
    
    if (extension !== expectedExtension) {
      return cb(new Error('File extension does not match MIME type'), false);
    }
    
    cb(null, true);
  };
};

// Storage configuration for different upload types
const createStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    }
  });
};

// Product image upload configuration
export const productImageUpload = multer({
  storage: createStorage('uploads/products'),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 5 // Maximum 5 files
  },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
});

// User avatar upload configuration
export const userAvatarUpload = multer({
  storage: createStorage('uploads/users'),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1 // Single file only
  },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
});

// Category image upload configuration
export const categoryImageUpload = multer({
  storage: createStorage('uploads/categories'),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1
  },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
});

// Brand image upload configuration
export const brandImageUpload = multer({
  storage: createStorage('uploads/brands'),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1
  },
  fileFilter: createFileFilter(ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
});

// Document upload configuration
export const documentUpload = multer({
  storage: createStorage('uploads/documents'),
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
    files: 3
  },
  fileFilter: createFileFilter(ALLOWED_DOCUMENT_TYPES, MAX_DOCUMENT_SIZE)
});

// Generic image upload middleware
export const uploadSingleImage = (fieldName = 'image') => {
  return (req, res, next) => {
    const upload = productImageUpload.single(fieldName);
    
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files uploaded'
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// Multiple images upload middleware
export const uploadMultipleImages = (fieldName = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const upload = productImageUpload.array(fieldName, maxCount);
    
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File too large. Maximum size is ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum allowed: ${maxCount}`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      next();
    });
  };
};

// File cleanup utility
export const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

// Cleanup multiple files
export const cleanupFiles = (filePaths) => {
  filePaths.forEach(filePath => {
    cleanupFile(filePath);
  });
};

// Middleware to validate uploaded file
export const validateUploadedFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }
  
  // Additional security validation can be added here
  // For example, checking file headers, scanning for malware, etc.
  
  next();
};

// Middleware to process and optimize images (placeholder for future implementation)
export const processImage = (req, res, next) => {
  // This middleware can be extended to:
  // - Resize images
  // - Compress images
  // - Generate thumbnails
  // - Convert formats
  
  next();
};

// Error handling middleware for file uploads
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error'
        });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  
  next();
};