const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { createArticleValidator, paginationValidator } = require('../middleware/validators');
const { uploadArticleImage } = require('../config/cloudinary');
const { uploadLimiter } = require('../middleware/rateLimiter');

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/homepage', articleController.getHomepageData);
router.get('/', paginationValidator, optionalAuth, articleController.getArticles);

// ── Article detail — must come before /:id routes so 'admin', 'upload' etc aren't caught as slugs
router.get('/admin/all',
  protect,
  authorize('editor', 'admin', 'superadmin'),
  paginationValidator,
  articleController.adminGetArticles
);

router.post('/upload/image',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  uploadLimiter,
  uploadArticleImage.single('image'),
  articleController.uploadImage
);

// ── Public article by slug/id ─────────────────────────────────────────────────
router.get('/:slug', optionalAuth, articleController.getArticle);

// Increment views (public, fire and forget)
router.post('/:slug/views', articleController.incrementViews);

// ── Author / Editor ───────────────────────────────────────────────────────────
router.post('/',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  createArticleValidator,
  articleController.createArticle
);

router.patch('/:id',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  articleController.updateArticle
);

router.delete('/:id',
  protect,
  authorize('editor', 'admin', 'superadmin'),
  articleController.deleteArticle
);

module.exports = router;
