const multer = require('multer');
const { sendError } = require('../utils/apiResponse');

/**
 * Catches Multer-specific errors (file too large, wrong type) before they reach
 * the generic errorHandler, so the client gets a clear 400 instead of a 500.
 *
 * Usage: place AFTER the multer middleware in the route chain.
 *   router.post('/upload/image',
 *     protect,
 *     uploadArticleImage.single('image'),
 *     handleMulterError,      // ← HERE
 *     articleController.uploadImage
 *   );
 */
const handleMulterError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, { statusCode: 400, message: 'File too large. Maximum allowed size is 10 MB.' });
    }
    return sendError(res, { statusCode: 400, message: `Upload error: ${err.message}` });
  }

  // Custom fileFilter error (e.g. "Only image files are allowed")
  if (err.message && err.message.includes('image')) {
    return sendError(res, { statusCode: 400, message: err.message });
  }

  // Pass anything else to the global error handler
  next(err);
};

module.exports = { handleMulterError };
