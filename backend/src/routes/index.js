// ── CATEGORIES ────────────────────────────────────────────────────────────────
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { categoryController, commentController, newsletterController, submissionController, userController } = require('../controllers/index');
const { createCommentValidator, submissionValidator, paginationValidator } = require('../middleware/validators');
const { uploadAvatar } = require('../config/cloudinary');

// ─── Categories Router ────────────────────────────────────────────────────────
const categoryRouter = express.Router();
categoryRouter.get('/', categoryController.getAll);
categoryRouter.get('/admin/all', protect, authorize('admin', 'superadmin'), categoryController.adminGetAll);
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
userRouter.get('/admin/list',            protect, authorize('admin', 'superadmin'), paginationValidator, userController.adminList);
userRouter.patch('/admin/:id/role',       protect, authorize('superadmin'),           userController.adminUpdateRole);
// Admins can create contributors/editors; only superadmin can create other admins (enforced in controller)
userRouter.post('/admin/create',          protect, authorize('admin', 'superadmin'),  userController.adminCreate);
userRouter.patch('/admin/:id/toggle-active', protect, authorize('admin', 'superadmin'), userController.adminToggleActive);
userRouter.patch('/admin/:id/profile',    protect, authorize('admin', 'superadmin'),  userController.adminUpdateProfile);
userRouter.delete('/admin/:id',           protect, authorize('superadmin'),           userController.adminDelete);

// -- Authenticated user (self) routes (static prefix) -------------------------
userRouter.patch('/me/profile', protect, uploadAvatar.single('avatar'), userController.updateProfile);
userRouter.patch('/me/saved/:articleId', protect, userController.toggleSavedArticle);

// -- Public dynamic route (must come last) ------------------------------------
userRouter.get('/:id/profile', userController.getPublicProfile);

// ─── Stats Router ─────────────────────────────────────────────────────────────
const Article  = require('../models/Article');
const User     = require('../models/User');
const Submission = require('../models/Submission');

const statsRouter = express.Router();
statsRouter.get('/', protect, authorize('editor', 'admin', 'superadmin'), async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      scheduledArticles,
      totalUsers,
      totalSubmissions,
      newSubmissions,
      viewsAgg,
      todayViewsAgg,
    ] = await Promise.all([
      Article.countDocuments({}),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      Article.countDocuments({ status: 'scheduled' }),
      User.countDocuments({}),
      Submission.countDocuments({}),
      Submission.countDocuments({ status: 'new' }),
      Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Article.aggregate([
        { $match: { updatedAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$views' } } },
      ]),
    ]);

    return res.json({
      success: true,
      data: {
        articles: {
          total:     totalArticles,
          published: publishedArticles,
          draft:     draftArticles,
          scheduled: scheduledArticles,
        },
        users:       { total: totalUsers },
        submissions: { total: totalSubmissions, new: newSubmissions },
        views: {
          total: viewsAgg[0]?.total      ?? 0,
          today: todayViewsAgg[0]?.total ?? 0,
        },
      },
    });
  } catch (err) { next(err); }
});

module.exports = { categoryRouter, commentRouter, adminCommentRouter, newsletterRouter, submissionRouter, userRouter, statsRouter };