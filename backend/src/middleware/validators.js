const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Run validation and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      statusCode: 422,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ───────────────────────────────────────────────────────────
const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  validate,
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  validate,
];

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase and number'),
  body('confirmPassword').custom((val, { req }) => {
    if (val !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  validate,
];

// ── Article Validators ────────────────────────────────────────────────────────
const createArticleValidator = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 300 }),
  body('excerpt').trim().notEmpty().withMessage('Excerpt is required').isLength({ max: 1000 }),
  body('body').optional(),                          // ← allow empty body for drafts
  body('category').isMongoId().withMessage('Valid category ID required'),
  body('contentType')
    .optional()
    .isIn([
      'news', 'investigation', 'opinion', 'analysis', 'ground-report',
      'explainer', 'interview', 'photo-essay', 'video-report', 'book-excerpt',
      'special-series', 'community-voice', 'verified-report', 'in-their-words',
    ])
    .withMessage('Invalid content type'),
  body('status')
    .optional()
    .isIn(['draft', 'review', 'scheduled', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  validate,
];

// ── Comment Validators ────────────────────────────────────────────────────────
const createCommentValidator = [
  body('body')
    .trim()
    .notEmpty()
    .withMessage('Comment body is required')
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
  body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID'),
  validate,
];

// ── Submission Validators ─────────────────────────────────────────────────────
const submissionValidator = [
  body('type')
    .isIn(['tip', 'community-voice', 'letter-to-editor', 'youth-writer', 'correction'])
    .withMessage('Invalid submission type'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('subject').trim().notEmpty().isLength({ max: 200 }),
  body('body').trim().notEmpty().isLength({ max: 10000 }),
  validate,
];

// ── Pagination Query ──────────────────────────────────────────────────────────
const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1–100'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  createArticleValidator,
  createCommentValidator,
  submissionValidator,
  paginationValidator,
};
