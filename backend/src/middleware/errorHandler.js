const logger = require('../utils/logger');

/**
 * Centralised error handling middleware
 * All errors thrown/passed via next(err) land here
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Mongoose Validation Error ─────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ── Mongoose Duplicate Key ─────────────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // ── Mongoose CastError (invalid ObjectId) ─────────────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── JWT Errors ────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // ── Multer Errors ─────────────────────────────────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size exceeds limit';
  }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`${statusCode} ${req.method} ${req.originalUrl} — ${err.stack}`);
  } else {
    logger.warn(`${statusCode} ${req.method} ${req.originalUrl} — ${message}`);
  }

  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  if (process.env.NODE_ENV === 'development') payload.stack = err.stack;

  res.status(statusCode).json(payload);
};

/**
 * 404 handler — attach to end of route chain
 */
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

module.exports = { errorHandler, notFound };
