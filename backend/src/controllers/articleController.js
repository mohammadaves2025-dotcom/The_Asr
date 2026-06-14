const Article = require('../models/Article');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const { sendSuccess, sendError, buildPaginationMeta } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../config/cloudinary');

// ── Role helpers ──────────────────────────────────────────────────────────────
const ELEVATED = ['editor', 'admin', 'superadmin'];
const isElevated = (role) => ELEVATED.includes(role);

// ── List Articles (public) ────────────────────────────────────────────────────
exports.getArticles = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, category, tag, author, contentType,
      isFeatured, isBreaking, search, sort = '-publishedAt', language,
    } = req.query;

    const filter = { status: 'published' };

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }
    if (tag) filter.tags = { $in: [tag.toLowerCase()] };
    if (author) filter.author = author;
    if (contentType) filter.contentType = contentType;
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isBreaking === 'true') filter.isBreaking = true;
    if (language) filter.language = language;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort(search ? { score: { $meta: 'textScore' } } : sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name avatar role designation')
        .populate('category', 'name slug color')
        .select('-body -editHistory -corrections -gallery'),
      Article.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { articles },
      meta: buildPaginationMeta(page, limit, total),
    });
  } catch (err) {
    next(err);
  }
};

// ── Get single public article ─────────────────────────────────────────────────
exports.getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug, status: 'published' })
      .populate('author', 'name avatar bio designation socialLinks')
      .populate('coAuthors', 'name avatar')
      .populate('category', 'name slug color')
      .populate('lastEditedBy', 'name')
      .populate('relatedArticles', 'title slug excerpt featuredImage publishedAt readTime author category');

    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    let related = [];
    if (article.tags && article.tags.length > 0) {
      const candidates = await Article.find({
        _id: { $ne: article._id },
        status: 'published',
        $or: [{ category: article.category._id }, { tags: { $in: article.tags } }],
      })
        .limit(20)
        .sort('-publishedAt')
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category tags');

      const tagSet = new Set(article.tags.map((t) => t.toLowerCase()));
      const scored = candidates
        .map((c) => ({ article: c, score: (c.tags ?? []).filter((t) => tagSet.has(t.toLowerCase())).length }))
        .sort((a, b) => b.score - a.score);
      related = scored.slice(0, 5).map((s) => s.article);
    } else {
      related = await Article.find({ _id: { $ne: article._id }, status: 'published', category: article.category._id })
        .limit(5).sort('-publishedAt')
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category');
    }

    return sendSuccess(res, { data: { article, related } });
  } catch (err) {
    next(err);
  }
};

// ── Homepage Data ─────────────────────────────────────────────────────────────
exports.getHomepageData = async (req, res, next) => {
  try {
    const published = { status: 'published' };

    const [hero, featured, latest, breaking, opinionPicks, categoryPreviews] = await Promise.all([
      Article.findOne({ ...published, isFeatured: true })
        .sort('-publishedAt')
        .populate('author', 'name avatar role')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category contentType'),

      Article.find({ ...published, isEditorsPick: true })
        .sort('-publishedAt').limit(4)
        .populate('author', 'name role')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category'),

      Article.find(published)
        .sort('-publishedAt').limit(8)
        .populate('author', 'name role')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category contentType'),

      Article.find({ ...published, isBreaking: true })
        .sort('-publishedAt').limit(5)
        .select('title slug category'),

      Article.find({ ...published, contentType: { $in: ['opinion', 'analysis'] } })
        .sort('-publishedAt').limit(3)
        .populate('author', 'name avatar role')
        .populate('category', 'name slug')
        .select('title slug author category contentType publishedAt'),

      Article.aggregate([
        { $match: published },
        { $sort: { publishedAt: -1 } },
        { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category.slug',
            categoryName:  { $first: '$category.name' },
            categoryColor: { $first: '$category.color' },
            articles: {
              $push: {
                _id: '$_id', title: '$title', slug: '$slug', excerpt: '$excerpt',
                featuredImage: '$featuredImage', publishedAt: '$publishedAt', readTime: '$readTime',
              },
            },
          },
        },
        { $project: { articles: { $slice: ['$articles', 3] }, categoryName: 1, categoryColor: 1 } },
        { $limit: 6 },
      ]),
    ]);

    return sendSuccess(res, { data: { hero, featured, latest, breaking, opinionPicks, categoryPreviews } });
  } catch (err) {
    next(err);
  }
};

// ── Create Article ────────────────────────────────────────────────────────────
exports.createArticle = async (req, res, next) => {
  try {
    const { status, ...rest } = req.body;

    // Contributors can only create drafts or submit for review — never publish directly
    let safeStatus = status || 'draft';
    if (req.user.role === 'contributor') {
      if (!['draft', 'review'].includes(safeStatus)) {
        return sendError(res, { statusCode: 403, message: 'Contributors can only save as draft or submit for review.' });
      }
    }

    const article = await Article.create({ ...rest, status: safeStatus, author: req.user._id });
    await article.populate('category', 'name slug');
    return sendSuccess(res, { statusCode: 201, message: 'Article created', data: { article } });
  } catch (err) {
    next(err);
  }
};

// ── Update Article ────────────────────────────────────────────────────────────
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    const userRole = req.user.role;
    const isOwner = article.author.toString() === req.user._id.toString();

    // Access check: elevated roles OR own article
    if (!isElevated(userRole) && !isOwner) {
      return sendError(res, { statusCode: 403, message: 'Access denied' });
    }

    // Strip fields that must never be overwritten via PATCH
    const {
      author, slug, views, likes, shares, commentsCount,
      editHistory, createdAt, updatedAt, __v,
      ...safeBody
    } = req.body;

    // Contributors: only draft or review — cannot publish, archive, or schedule
    if (userRole === 'contributor') {
      if (safeBody.status && !['draft', 'review'].includes(safeBody.status)) {
        return sendError(res, { statusCode: 403, message: 'Contributors can only save as draft or submit for review.' });
      }
      // Contributors cannot modify featured/breaking/editors-pick flags
      delete safeBody.isFeatured;
      delete safeBody.isBreaking;
      delete safeBody.isEditorsPick;
      // Contributors cannot change co-authors, scheduled time, or language
      delete safeBody.coAuthors;
      delete safeBody.scheduledFor;
    }

    // Editors cannot publish — only admin/superadmin can
    if (userRole === 'editor') {
      if (safeBody.status === 'published') {
        return sendError(res, { statusCode: 403, message: 'Editors cannot publish directly. An admin must approve.' });
      }
    }

    article.editHistory.push({ editedBy: req.user._id, note: req.body.editNote });
    article.lastEditedBy = req.user._id;
    Object.assign(article, safeBody);
    await article.save();

    return sendSuccess(res, { message: 'Article updated', data: { article } });
  } catch (err) {
    next(err);
  }
};

// ── Delete Article ────────────────────────────────────────────────────────────
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    // Only admin and superadmin can delete articles
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      return sendError(res, { statusCode: 403, message: 'Only admins can delete articles.' });
    }

    await Comment.deleteMany({ article: article._id });
    await article.deleteOne();
    return sendSuccess(res, { message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Upload Featured Image ─────────────────────────────────────────────────────
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, { statusCode: 400, message: 'No image file received. Ensure the field name is "image".' });

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'theasr/articles',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 1200, height: 675, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
      ],
    });

    return sendSuccess(res, {
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Get Single Article by ID ──────────────────────────────────────────
exports.adminGetArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('author', 'name email avatar')
      .populate('coAuthors', 'name avatar')
      .populate('category', 'name slug color')
      .populate('lastEditedBy', 'name')
      .populate('relatedArticles', 'title slug excerpt featuredImage publishedAt readTime author category');

    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    // Contributors can only view their own articles
    const isOwner = article.author._id.toString() === req.user._id.toString();
    if (!isElevated(req.user.role) && !isOwner) {
      return sendError(res, { statusCode: 403, message: 'Access denied' });
    }

    return sendSuccess(res, { data: { article } });
  } catch (err) {
    next(err);
  }
};

// ── Admin: All Articles ───────────────────────────────────────────────────────
exports.adminGetArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, author, category, search } = req.query;
    const filter = {};

    // Contributors only see their own articles — always enforced server-side
    if (req.user.role === 'contributor') {
      filter.author = req.user._id;
    } else {
      if (author) filter.author = author;
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort('-updatedAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name email role')
        .populate('category', 'name slug')
        .select('-body'),
      Article.countDocuments(filter),
    ]);

    return sendSuccess(res, { data: { articles }, meta: buildPaginationMeta(page, limit, total) });
  } catch (err) {
    next(err);
  }
};

// ── Increment Views ───────────────────────────────────────────────────────────
exports.incrementViews = async (req, res, next) => {
  try {
    const filter = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.slug }
      : { slug: req.params.slug };
    await Article.findOneAndUpdate(filter, { $inc: { views: 1 } });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};
