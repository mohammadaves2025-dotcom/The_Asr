const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage — we upload the buffer directly to Cloudinary
const memoryStorage = multer.memoryStorage();

// ── Upload buffer to Cloudinary ───────────────────────────────────────────────
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    Readable.from(buffer).pipe(stream);
  });
};

// ── Article image upload ──────────────────────────────────────────────────────
const uploadArticleImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// ── Avatar upload ─────────────────────────────────────────────────────────────
const uploadAvatar = multer({
  storage: memoryStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

module.exports = { cloudinary, uploadArticleImage, uploadAvatar, uploadToCloudinary };