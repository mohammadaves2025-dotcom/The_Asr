const sanitizeHtml = require('sanitize-html');

// Allowed tags/attributes for article rich-text body (Quill / TipTap output)
const RICH_TEXT_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'h4', 'figure', 'figcaption',
    'blockquote', 'pre', 'code', 'iframe',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    'img': ['src', 'alt', 'width', 'height'],
    'a':   ['href', 'target', 'rel'],
    'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
    '*': ['class'],
  },
  // Allow only safe iframe sources (YouTube / Vimeo)
  allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com'],
};

// Recursively sanitize all string values in an object — strips ALL HTML
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
 * Middleware: sanitize req.body, req.query, req.params.
 *
 * The article `body` field carries rich HTML from Quill/TipTap and must NOT
 * be fully stripped — it is pulled out, sanitized with an allowed-tags
 * whitelist, then put back. All other string fields have tags stripped entirely.
 */
const xssSanitize = (req, res, next) => {
  if (req.body) {
    // Extract rich-text field before blanket sanitization
    const { body: richBody, ...rest } = req.body;
    req.body = sanitizeObject(rest);

    if (richBody !== undefined) {
      // Sanitize with whitelist instead of stripping everything
      req.body.body = typeof richBody === 'string'
        ? sanitizeHtml(richBody, RICH_TEXT_OPTIONS)
        : richBody; // non-string (null / undefined) — pass through unchanged
    }
  }

  if (req.query)  req.query  = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

module.exports = xssSanitize;