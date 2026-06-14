const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
  });

// ── Limiters ──────────────────────────────────────────────────────────────────

/** General API: 100 requests per 15 min */
const apiLimiter = createLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests, please try again in 15 minutes'
);

/** Auth endpoints: 10 attempts per 15 min */
const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts, please try again in 15 minutes'
);

/** Registration: 5 per hour */
const registerLimiter = createLimiter(
  60 * 60 * 1000,
  5,
  'Too many accounts created from this IP, please try again in an hour'
);

/** Password reset: 3 per hour */
const passwordResetLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many password reset requests, please try again in an hour'
);

/** Upload: 20 per hour */
const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'Upload limit reached, please try again in an hour'
);

/** Search: 30 per minute */
const searchLimiter = createLimiter(
  60 * 1000,
  30,
  'Search rate limit exceeded'
);

/** Token refresh: 30 per 15 min — generous enough for normal access-token expiry cycles */
const refreshLimiter = createLimiter(
  15 * 60 * 1000,
  30,
  'Too many token refresh attempts, please log in again'
);

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  searchLimiter,
  refreshLimiter,
};
