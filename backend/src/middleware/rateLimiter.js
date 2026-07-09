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

/**
 * General API: applied globally to every /api/* request combined (see
 * app.js). A single article page alone fires several calls (categories,
 * article, comments, views, related). 100/15min per IP was getting hit by
 * normal browsing on shared IPs (campus/hostel NAT, offices) — raised to a
 * more realistic ceiling. Still low enough to blunt basic scraping/abuse.
 */
const apiLimiter = createLimiter(
  15 * 60 * 1000,
  300,
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

/** Password reset — requesting the email: 3 per hour */
const passwordResetLimiter = createLimiter(
  60 * 60 * 1000,
  3,
  'Too many password reset requests, please try again in an hour'
);

/**
 * Password reset — actually consuming the token on /reset-password/:token.
 * Kept as a separate limiter (not reused from passwordResetLimiter above) so
 * someone who requested a couple of reset emails isn't then locked out of
 * submitting their new password. A bit more headroom since typos in the new
 * password field are a normal reason to retry.
 */
const resetPasswordConsumeLimiter = createLimiter(
  60 * 60 * 1000,
  10,
  'Too many attempts, please request a new password reset link'
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

/**
 * Public AI endpoints (/summary, /translate): 20 per hour per IP.
 * These proxy to Google Gemini — a tighter limit protects API quota from abuse
 * while still being generous for genuine readers (articles rarely need
 * re-summarising or re-translating more than a handful of times per hour).
 */
const aiPublicLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'AI request limit reached, please try again in an hour'
);

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  resetPasswordConsumeLimiter,
  uploadLimiter,
  searchLimiter,
  refreshLimiter,
  aiPublicLimiter,
};