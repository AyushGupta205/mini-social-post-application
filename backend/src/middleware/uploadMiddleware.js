const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isCloudinaryConfigured, configureCloudinary } = require('../config/cloudinary');

// Allowed image formats
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];

// File filter function
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, JPG, PNG, WEBP, and GIF images are allowed.'
      ),
      false
    );
  }
};

const getStorage = () => {
  if (isCloudinaryConfigured()) {
    configureCloudinary();
    return new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'mini-social-posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1200, crop: 'limit' }]
      }
    });
  }

  // Local Disk Storage fallback (for development / testing environments only)
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `post-${uniqueSuffix}${ext}`);
    }
  });
};

const createMulterInstance = () => {
  return multer({
    storage: getStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5 MB max
    },
    fileFilter: fileFilter
  });
};

const upload = {
  single: (fieldName) => {
    return (req, res, next) => {
      const uploader = createMulterInstance().single(fieldName);
      uploader(req, res, (err) => {
        if (err) return next(err);

        // Fail-safe guard: If in production without Cloudinary, reject image upload attempts
        if (req.file && process.env.NODE_ENV === 'production' && !isCloudinaryConfigured()) {
          // Remove local file if written by fallback to avoid disk pollution
          if (req.file.path && fs.existsSync(req.file.path)) {
            try {
              fs.unlinkSync(req.file.path);
            } catch {
              // Ignore cleanup error
            }
          }
          return res.status(503).json({
            success: false,
            message:
              'Image upload is currently unavailable in production because persistent cloud storage (Cloudinary) is not configured in environment variables.'
          });
        }

        next();
      });
    };
  }
};

module.exports = upload;
