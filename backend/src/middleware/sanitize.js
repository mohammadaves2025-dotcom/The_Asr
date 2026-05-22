const sanitizeHtml = require('sanitize-html');

// Recursively sanitize all string values in an object
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, { allowedTags: [], allowedAttributes: {} });
  }
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const key of Object.keys(obj)) clean[key] = sanitizeObject(obj[key]);
    return clean;
  }
  return obj;
};

/**
 * Middleware: strip all HTML tags from req.body, req.query, req.params
 * Exceptions: article body field (rich HTML) is intentionally skipped here
 *             and sanitized separately in the article service with allowed tags.
 */
const xssSanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = xssSanitize;
