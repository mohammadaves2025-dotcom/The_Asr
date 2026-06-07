// ── CATEGORIES ────────────────────────────────────────────────────────────────
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { categoryController, commentController, newsletterController, submissionController, userController } = require('../controllers/index');
const { createCommentValidator, submissionValidator, paginationValidator } = require('../middleware/validators');
const { uploadAvatar } = require('../config/cloudinary');

// ─── Categories Router ────────────────────────────────────────────────────────
const categoryRouter = express.Router();
categoryRouter.get('/', categoryController.getAll);
categoryRouter.get('/:slug', categoryController.getOne);
categoryRouter.post('/', protect, authorize('admin', 'superadmin'), categoryController.create);
categoryRouter.patch('/:id', protect, authorize('admin', 'superadmin'), categoryController.update);
categoryRouter.delete('/:id', protect, authorize('admin', 'superadmin'), categoryController.delete);

// ─── Comments Router ──────────────────────────────────────────────────────────
const commentRouter = express.Router({ mergeParams: true });
commentRouter.get('/', commentController.getForArticle);
commentRouter.get('/:commentId/replies', commentController.getReplies);
commentRouter.post('/', protect, createCommentValidator, commentController.create);
commentRouter.patch('/:id/moderate', protect, authorize('editor', 'admin', 'superadmin'), commentController.moderate);
commentRouter.delete('/:id', protect, authorize('editor', 'admin', 'superadmin'), commentController.delete);

// ─── Admin Comments Router (global, not article-scoped) ───────────────────────
const adminCommentRouter = express.Router();
adminCommentRouter.get('/', protect, authorize('editor', 'admin', 'superadmin'), commentController.adminList);
adminCommentRouter.patch('/:id/moderate', protect, authorize('editor', 'admin', 'superadmin'), commentController.moderate);
adminCommentRouter.delete('/:id', protect, authorize('editor', 'admin', 'superadmin'), commentController.delete);

// ─── Newsletter Router ────────────────────────────────────────────────────────
const newsletterRouter = express.Router();
newsletterRouter.post('/subscribe', newsletterController.subscribe);
newsletterRouter.get('/confirm/:token', newsletterController.confirm);
newsletterRouter.get('/unsubscribe/:token', newsletterController.unsubscribe);
newsletterRouter.get('/admin/subscribers', protect, authorize('admin', 'superadmin'), paginationValidator, newsletterController.adminList);

// ─── Submissions Router ───────────────────────────────────────────────────────
const submissionRouter = express.Router();
submissionRouter.post('/', submissionValidator, submissionController.create);
submissionRouter.get('/admin', protect, authorize('editor', 'admin', 'superadmin'), paginationValidator, submissionController.adminList);
submissionRouter.patch('/admin/:id/status', protect, authorize('editor', 'admin', 'superadmin'), submissionController.updateStatus);

// ─── Users Router ─────────────────────────────────────────────────────────────
// IMPORTANT: static/prefixed routes (/me/*, /admin/*) must be declared BEFORE
// the dynamic /:id route, otherwise Express will treat "me" and "admin" as
// ObjectId values and the routes will never match correctly.
const userRouter = express.Router();

// -- Admin routes (static prefix — must come before /:id) ---------------------
userRouter.get('/admin/list', protect, authorize('admin', 'superadmin'), paginationValidator, userController.adminList);
userRouter.patch('/admin/:id/role', protect, authorize('superadmin'), userController.adminUpdateRole);
userRouter.post('/admin/create', protect, authorize('superadmin'), userController.adminCreate);
userRouter.patch('/admin/:id/toggle-active', protect, authorize('admin', 'superadmin'), userController.adminToggleActive);
 userRouter.patch(
    '/admin/:id/profile',
    protect,
    authorize('admin', 'superadmin'),
    userController.adminUpdateProfile
  );

userRouter.delete('/admin/:id', protect, authorize('superadmin'), userController.adminDelete);

// -- Authenticated user (self) routes (static prefix) -------------------------
userRouter.patch('/me/profile', protect, uploadAvatar.single('avatar'), userController.updateProfile);
userRouter.patch('/me/saved/:articleId', protect, userController.toggleSavedArticle);

// -- Public dynamic route (must come last) ------------------------------------
userRouter.get('/:id/profile', userController.getPublicProfile);

module.exports = { categoryRouter, commentRouter, adminCommentRouter, newsletterRouter, submissionRouter, userRouter };