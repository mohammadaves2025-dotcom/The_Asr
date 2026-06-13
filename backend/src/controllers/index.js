// ─────────────────────────────────────────────────────────────────────────────
// controllers/index.js — re-exports all controllers for clean imports
// ─────────────────────────────────────────────────────────────────────────────

// ── CATEGORY CONTROLLER ───────────────────────────────────────────────────────
const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../config/cloudinary'); // ← ADD THIS LINE

const categoryController = {
  // Public: only active categories, sorted by order
  getAll: async (req, res, next) => {
    try {
      const categories = await Category.find({ isActive: true })
        .sort('order')
        .populate('articleCount');
      return sendSuccess(res, { data: { categories } });
    } catch (err) { next(err); }
  },

  // Admin: ALL categories regardless of isActive, for full management
  adminGetAll: async (req, res, next) => {
    try {
      const categories = await Category.find({})
        .sort('order')
        .populate('articleCount');
      return sendSuccess(res, { data: { categories } });
    } catch (err) { next(err); }
  },

  getOne: async (req, res, next) => {
    try {
      const cat = await Category.findOne({ slug: req.params.slug, isActive: true });
      if (!cat) return sendError(res, { statusCode: 404, message: 'Category not found' });
      return sendSuccess(res, { data: { category: cat } });
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      // Mutual exclusivity: navbar and More are separate placements
      if (req.body.isFeatured && req.body.showInMore) {
        req.body.showInMore = false;
      }
      const cat = await Category.create(req.body);
      return sendSuccess(res, { statusCode: 201, data: { category: cat } });
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      // Mutual exclusivity guard
      if (req.body.isFeatured && req.body.showInMore) {
        req.body.showInMore = false;
      }
      const cat = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true, runValidators: true,
      });
      if (!cat) return sendError(res, { statusCode: 404, message: 'Category not found' });
      return sendSuccess(res, { data: { category: cat } });
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      await Category.findByIdAndDelete(req.params.id);
      return sendSuccess(res, { message: 'Category deleted' });
    } catch (err) { next(err); }
  },
};

// ── COMMENT CONTROLLER ────────────────────────────────────────────────────────
const Comment = require('../models/Comment');
const Article = require('../models/Article');

const commentController = {
  getForArticle: async (req, res, next) => {
    try {
      const { articleId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const comments = await Comment.find({
        article: articleId,
        status: 'approved',
        parentComment: null,
      })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name avatar role')
        .populate({
          path: 'replyCount',
        });

      return sendSuccess(res, { data: { comments } });
    } catch (err) { next(err); }
  },

  getReplies: async (req, res, next) => {
    try {
      const replies = await Comment.find({
        parentComment: req.params.commentId,
        status: 'approved',
      })
        .sort('createdAt')
        .populate('author', 'name avatar role');
      return sendSuccess(res, { data: { replies } });
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { articleId } = req.params;
      const article = await Article.findById(articleId);
      if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

      const comment = await Comment.create({
        article: articleId,
        author: req.user._id,
        body: req.body.body,
        parentComment: req.body.parentComment || null,
        // Auto-approve for editors/admins
        status: ['admin', 'superadmin', 'editor'].includes(req.user.role) ? 'approved' : 'pending',
      });

      await Article.findByIdAndUpdate(articleId, { $inc: { commentsCount: 1 } });
      await comment.populate('author', 'name avatar role');

      return sendSuccess(res, {
        statusCode: 201,
        message: comment.status === 'approved' ? 'Comment posted' : 'Comment submitted for review',
        data: { comment },
      });
    } catch (err) { next(err); }
  },

  moderate: async (req, res, next) => {
    try {
      const { status, note } = req.body;
      const comment = await Comment.findByIdAndUpdate(
        req.params.id,
        { status, moderatedBy: req.user._id, moderatedAt: new Date(), moderationNote: note },
        { new: true }
      );
      if (!comment) return sendError(res, { statusCode: 404, message: 'Comment not found' });
      return sendSuccess(res, { message: `Comment ${status}`, data: { comment } });
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      await Comment.findByIdAndDelete(req.params.id);
      return sendSuccess(res, { message: 'Comment deleted' });
    } catch (err) { next(err); }
  },

  // Admin: global comments queue across all articles
  adminList: async (req, res, next) => {
    try {
      const { page = 1, limit = 30, status, search } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (search) filter.body = { $regex: search, $options: 'i' };
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        Comment.find(filter)
          .sort('-createdAt')
          .skip(skip)
          .limit(Number(limit))
          .populate('author', 'name avatar email role')
          .populate('article', 'title slug'),
        Comment.countDocuments(filter),
      ]);

      const { buildPaginationMeta } = require('../utils/apiResponse');
      return sendSuccess(res, {
        data: { comments },
        meta: buildPaginationMeta(page, limit, total),
      });
    } catch (err) { next(err); }
  },
};

// ── NEWSLETTER CONTROLLER ─────────────────────────────────────────────────────
const crypto = require('crypto');
const Newsletter = require('../models/Newsletter');
const { sendNewsletterConfirmEmail } = require('../utils/email');
const logger = require('../utils/logger');

const newsletterController = {
  subscribe: async (req, res, next) => {
    try {
      const { email, name, source } = req.body;

      let subscriber = await Newsletter.findOne({ email });
      if (subscriber?.isConfirmed) {
        return sendSuccess(res, { message: 'You are already subscribed' });
      }

      if (!subscriber) {
        subscriber = new Newsletter({ email, name, source });
      }

      const confirmToken = subscriber.generateConfirmToken();
      await subscriber.save();

      const confirmUrl = `${process.env.CLIENT_URL}/newsletter/confirm/${confirmToken}`;
      sendNewsletterConfirmEmail(email, confirmUrl).catch((e) =>
        logger.error('Newsletter confirm email failed:', e)
      );

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Please check your email to confirm your subscription',
      });
    } catch (err) { next(err); }
  },

  confirm: async (req, res, next) => {
    try {
      const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
      const subscriber = await Newsletter.findOne({
        confirmToken: hashed,
        confirmTokenExpires: { $gt: Date.now() },
      });

      if (!subscriber) return sendError(res, { statusCode: 400, message: 'Invalid or expired confirmation link' });

      subscriber.isConfirmed = true;
      subscriber.subscribedAt = new Date();
      subscriber.confirmToken = undefined;
      subscriber.confirmTokenExpires = undefined;
      await subscriber.save();

      return sendSuccess(res, { message: 'Subscription confirmed — welcome to The The Orbis Journal Dispatch!' });
    } catch (err) { next(err); }
  },

  unsubscribe: async (req, res, next) => {
    try {
      const subscriber = await Newsletter.findOne({ unsubscribeToken: req.params.token });
      if (!subscriber) return sendError(res, { statusCode: 404, message: 'Subscription not found' });

      subscriber.isActive = false;
      subscriber.unsubscribedAt = new Date();
      await subscriber.save();

      return sendSuccess(res, { message: 'Unsubscribed successfully' });
    } catch (err) { next(err); }
  },

  adminList: async (req, res, next) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;
      const [subs, total] = await Promise.all([
        Newsletter.find({ isActive: true, isConfirmed: true }).sort('-subscribedAt').skip(skip).limit(Number(limit)),
        Newsletter.countDocuments({ isActive: true, isConfirmed: true }),
      ]);
      return sendSuccess(res, { data: { subscribers: subs }, meta: { total, page: Number(page) } });
    } catch (err) { next(err); }
  },
};

// ── SUBMISSION CONTROLLER ─────────────────────────────────────────────────────
const Submission = require('../models/Submission');

const submissionController = {
  create: async (req, res, next) => {
    try {
      const submission = await Submission.create({
        ...req.body,
        submitter: req.user?._id,
      });
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Submission received — our team will review it shortly',
        data: { id: submission._id },
      });
    } catch (err) { next(err); }
  },

  adminList: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, status, type } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (type) filter.type = type;
      const skip = (page - 1) * limit;
      const [submissions, total] = await Promise.all([
        Submission.find(filter).sort('-createdAt').skip(skip).limit(Number(limit))
          .populate('submitter', 'name email').populate('assignedTo', 'name'),
        Submission.countDocuments(filter),
      ]);
      return sendSuccess(res, { data: { submissions }, meta: { total, page: Number(page) } });
    } catch (err) { next(err); }
  },

  updateStatus: async (req, res, next) => {
    try {
      const sub = await Submission.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status, reviewNotes: req.body.reviewNotes, reviewedAt: new Date(), assignedTo: req.user._id },
        { new: true }
      );
      if (!sub) return sendError(res, { statusCode: 404, message: 'Submission not found' });
      return sendSuccess(res, { data: { submission: sub } });
    } catch (err) { next(err); }
  },
};

// ── USER CONTROLLER ───────────────────────────────────────────────────────────
const User = require('../models/User');

const userController = {
  updateProfile: async (req, res, next) => {
    try {
      const allowed = ['name', 'bio', 'designation', 'socialLinks', 'followedCategories', 'newsletterSubscribed'];
      const updates = {};
      allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

      // Inside updateProfile, find where req.file is handled and replace:
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'theasr/avatars',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face', quality: 'auto' },
          ],
        });
        updates.avatar = result.secure_url;
      }

      const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
      return sendSuccess(res, { data: { user } });
    } catch (err) { next(err); }
  },

  toggleSavedArticle: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const { articleId } = req.params;
      const idx = user.savedArticles.indexOf(articleId);
      if (idx > -1) {
        user.savedArticles.splice(idx, 1);
      } else {
        user.savedArticles.push(articleId);
      }
      await user.save();
      const saved = idx === -1;
      return sendSuccess(res, { message: saved ? 'Article saved' : 'Article removed', data: { saved } });
    } catch (err) { next(err); }
  },

  getPublicProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
        .select('name avatar bio designation socialLinks role createdAt')
        .populate('articlesCount');
      if (!user) return sendError(res, { statusCode: 404, message: 'User not found' });

      const recentArticles = await Article.find({ author: user._id, status: 'published' })
        .sort('-publishedAt').limit(6)
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime category');

      return sendSuccess(res, { data: { user, recentArticles } });
    } catch (err) { next(err); }
  },

  // Admin only
  adminList: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, role, search } = req.query;
      const filter = {};
      if (role) filter.role = role;
      if (search) filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)).select('-refreshTokens').populate('articlesCount'),
        User.countDocuments(filter),
      ]);
      const { buildPaginationMeta } = require('../utils/apiResponse');
      return sendSuccess(res, { data: { users }, meta: buildPaginationMeta(page, limit, total) });
    } catch (err) { next(err); }
  },

  adminCreate: async (req, res, next) => {
    try {
      const { name, email, password, role, designation, bio, avatar, socialLinks } = req.body;

      if (!name || !email || !password) {
        return sendError(res, { statusCode: 400, message: 'Name, email and password are required' });
      }

      if (password.length < 8) {
        return sendError(res, { statusCode: 400, message: 'Password must be at least 8 characters' });
      }

      // Admins can only create contributors and editors — superadmin required for admin/superadmin
      const requestingRole = req.user.role;
      const targetRole = role || 'contributor';
      const ELEVATED_ROLES = ['admin', 'superadmin'];
      if (ELEVATED_ROLES.includes(targetRole) && requestingRole !== 'superadmin') {
        return sendError(res, { statusCode: 403, message: 'Only superadmin can create admin or superadmin accounts' });
      }

      const existing = await User.findOne({ email });
      if (existing) return sendError(res, { statusCode: 409, message: 'Email already registered' });

      const user = await User.create({
        name,
        email,
        password,
        role: targetRole,
        designation: designation || undefined,
        bio: bio || undefined,
        avatar: avatar || undefined,
        socialLinks: socialLinks || undefined,
        provider: 'local',
        isVerified: true,
        isActive: true,
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'User created successfully',
        data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, designation: user.designation } },
      });
    } catch (err) { next(err); }
  },

  adminUpdateRole: async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
      );
      if (!user) return sendError(res, { statusCode: 404, message: 'User not found' });
      return sendSuccess(res, { data: { user } });
    } catch (err) { next(err); }
  },

  adminToggleActive: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return sendError(res, { statusCode: 404, message: 'User not found' });
      user.isActive = !user.isActive;
      await user.save();
      return sendSuccess(res, { message: `User ${user.isActive ? 'activated' : 'deactivated'}`, data: { isActive: user.isActive } });
    } catch (err) { next(err); }
  },
  adminUpdateProfile: async (req, res, next) => {
    try {
      const { id } = req.params;
 
      // Fields admin is allowed to set on another user's profile
      const allowed = [
        'name',
        'designation',
        'bio',
        'avatar',
        'socialLinks',
      ];
 
      const updates = {};
      allowed.forEach((k) => {
        if (req.body[k] !== undefined) updates[k] = req.body[k];
      });
 
      // Prevent accidentally clearing socialLinks sub-fields:
      // merge the incoming socialLinks with what's already stored
      if (updates.socialLinks) {
        const existing = await User.findById(id).select('socialLinks');
        updates.socialLinks = {
          ...(existing?.socialLinks?.toObject?.() ?? {}),
          ...updates.socialLinks,
        };
        // Remove keys explicitly set to empty string so they don't litter the DB
        Object.keys(updates.socialLinks).forEach((k) => {
          if (!updates.socialLinks[k]) delete updates.socialLinks[k];
        });
      }
 
      const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).select('-refreshTokens -password');
 
      if (!user) return sendError(res, { statusCode: 404, message: 'User not found' });
 
      return sendSuccess(res, { message: 'Profile updated', data: { user } });
    } catch (err) {
      next(err);
    }
  },

  adminDelete: async (req, res, next) => {
    try {
      if (req.params.id === req.user._id.toString()) {
        return sendError(res, { statusCode: 400, message: 'Cannot delete yourself' });
      }
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return sendError(res, { statusCode: 404, message: 'User not found' });
      return sendSuccess(res, { message: 'User deleted' });
    } catch (err) { next(err); }
  },
};

module.exports = {
  categoryController,
  commentController,
  newsletterController,
  submissionController,
  userController,
};
