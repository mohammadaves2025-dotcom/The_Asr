const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { createArticleValidator, paginationValidator } = require('../middleware/validators');
const { uploadArticleImage } = require('../config/cloudinary');
const { uploadLimiter, searchLimiter } = require('../middleware/rateLimiter');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', paginationValidator, optionalAuth, articleController.getArticles);
router.get('/homepage', articleController.getHomepageData);
router.get('/:slug', optionalAuth, articleController.getArticle);

// ── Author / Editor ───────────────────────────────────────────────────────────
router.post(
  '/',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  createArticleValidator,
  articleController.createArticle
);

router.patch(
  '/:id',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  articleController.updateArticle
);

router.delete(
  '/:id',
  protect,
  authorize('editor', 'admin', 'superadmin'),
  articleController.deleteArticle
);

// ── Image Upload ──────────────────────────────────────────────────────────────
router.post(
  '/upload/image',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  uploadLimiter,
  uploadArticleImage.single('image'),
  articleController.uploadImage
);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get(
  '/admin/all',
  protect,
  authorize('editor', 'admin', 'superadmin'),
  paginationValidator,
  articleController.adminGetArticles
);

module.exports = router;
