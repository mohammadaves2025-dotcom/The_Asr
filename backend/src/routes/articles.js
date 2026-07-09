const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { createArticleValidator, paginationValidator } = require('../middleware/validators');
const { uploadArticleImage } = require('../config/cloudinary');
const { uploadLimiter, searchLimiter } = require('../middleware/rateLimiter');
const { handleMulterError } = require('../middleware/multerErrorHandler');

// This route doubles as the category/tag/format listing endpoint AND the
// search endpoint (?search=). Only apply the stricter searchLimiter when a
// search is actually being performed, so normal category/home browsing keeps
// using just the shared global apiLimiter.
const searchOnlyLimiter = (req, res, next) =>
  req.query.search ? searchLimiter(req, res, next) : next();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/homepage', articleController.getHomepageData);
router.get('/', paginationValidator, optionalAuth, searchOnlyLimiter, articleController.getArticles);

// ── Admin: all articles (contributors hit this too — scoping is enforced in controller) ──
router.get('/admin/all',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  paginationValidator,
  articleController.adminGetArticles
);

// ── Admin: single article by ID ───────────────────────────────────────────────
router.get('/admin/:id',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  articleController.adminGetArticle
);

// ── Image upload — contributor+ ───────────────────────────────────────────────
router.post('/upload/image',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  uploadLimiter,
  uploadArticleImage.single('image'),
  handleMulterError,
  articleController.uploadImage
);

// ── Public: article by slug ───────────────────────────────────────────────────
router.get('/:slug', optionalAuth, articleController.getArticle);

// ── Public: increment views ───────────────────────────────────────────────────
router.post('/:slug/views', articleController.incrementViews);

// ── Create article — contributor+ ────────────────────────────────────────────
router.post('/',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  createArticleValidator,
  articleController.createArticle
);

// ── Set hero article — admin and superadmin only ──────────────────────────────
router.patch('/admin/:id/set-hero',
  protect,
  authorize('admin', 'superadmin'),
  articleController.setHero
);

// ── Update article — contributor+ (ownership + role enforced in controller) ───
router.patch('/:id',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  articleController.updateArticle
);

// ── Delete article — admin and superadmin only ────────────────────────────────
router.delete('/:id',
  protect,
  authorize('admin', 'superadmin'),
  articleController.deleteArticle
);

module.exports = router;