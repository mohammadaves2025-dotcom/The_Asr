const Article = require('../models/Article');
const Category = require('../models/Category');
const { sendSuccess, sendError, buildPaginationMeta } = require('../utils/apiResponse');
const { uploadToCloudinary } = require('../config/cloudinary'); // ← ADD THIS LINE

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

    if (search) {
      filter.$text = { $search: search };
    }

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

//getArticle
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

    // ── Improved related articles (tag-count weighted) ────────────────────────
    //
    // Strategy:
    //   1. Find up to 20 candidates from same category OR sharing any tag.
    //   2. Score each candidate by how many tags it shares with this article.
    //   3. Return the top 5 by score, then by recency as a tiebreaker.
    //
    // This is a pure-JS approach that works without any schema changes or
    // full-text search infrastructure.

    let related = [];

    if (article.tags && article.tags.length > 0) {
      const candidates = await Article.find({
        _id: { $ne: article._id },
        status: 'published',
        $or: [
          { category: article.category._id },
          { tags: { $in: article.tags } },
        ],
      })
        .limit(20)
        .sort('-publishedAt')
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category tags');

      // Score by shared tag count
      const tagSet = new Set(article.tags.map((t) => t.toLowerCase()));

      const scored = candidates
        .map((c) => {
          const sharedTags = (c.tags ?? []).filter((t) => tagSet.has(t.toLowerCase())).length;
          return { article: c, score: sharedTags };
        })
        .sort((a, b) => b.score - a.score || 0); // sort by score desc (publishedAt already sorted)

      related = scored.slice(0, 5).map((s) => s.article);
    } else {
      // No tags — fall back to same category
      related = await Article.find({
        _id: { $ne: article._id },
        status: 'published',
        category: article.category._id,
      })
        .limit(5)
        .sort('-publishedAt')
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category');
    }

    return sendSuccess(res, { data: { article, related } });
  } catch (err) {
    next(err);
  }
};

// ── Homepage Data (aggregated) ────────────────────────────────────────────────
exports.getHomepageData = async (req, res, next) => {
  try {
    const published = { status: 'published' };

    const [hero, featured, latest, breaking, opinionPicks, categoryPreviews] = await Promise.all([
      // Hero: single top featured story
      Article.findOne({ ...published, isFeatured: true })
        .sort('-publishedAt')
        .populate('author', 'name avatar role')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category contentType'),

      // Editor's picks
      Article.find({ ...published, isEditorsPick: true })
        .sort('-publishedAt')
        .limit(4)
        .populate('author', 'name role')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category'),

      // Latest 8 articles
      Article.find(published)
        .sort('-publishedAt')
        .limit(8)
        .populate('author', 'name role')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category contentType'),

      // Breaking news ticker
      Article.find({ ...published, isBreaking: true })
        .sort('-publishedAt')
        .limit(5)
        .select('title slug category'),

      // Opinion section picks
      Article.find({ ...published, contentType: { $in: ['opinion', 'analysis'] } })
        .sort('-publishedAt')
        .limit(3)
        .populate('author', 'name avatar role')
        .populate('category', 'name slug')
        .select('title slug author category contentType publishedAt'),

      // Category previews — top 3 articles per key category
      Article.aggregate([
        { $match: published },
        { $sort: { publishedAt: -1 } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$category.slug',
            categoryName: { $first: '$category.name' },
            categoryColor: { $first: '$category.color' },
            articles: {
              $push: {
                _id: '$_id',
                title: '$title',
                slug: '$slug',
                excerpt: '$excerpt',
                featuredImage: '$featuredImage',
                publishedAt: '$publishedAt',
                readTime: '$readTime',
              },
            },
          },
        },
        { $project: { articles: { $slice: ['$articles', 3] }, categoryName: 1, categoryColor: 1 } },
        { $limit: 6 },
      ]),
    ]);

    return sendSuccess(res, {
      data: { hero, featured, latest, breaking, opinionPicks, categoryPreviews },
    });
  } catch (err) {
    next(err);
  }
};

// ── Create Article (CMS) ──────────────────────────────────────────────────────
exports.createArticle = async (req, res, next) => {
  try {
    const article = await Article.create({ ...req.body, author: req.user._id });
    await article.populate('category', 'name slug');
    return sendSuccess(res, { statusCode: 201, message: 'Article created', data: { article } });
  } catch (err) {
    next(err);
  }
};


exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    const canEdit = ['admin', 'superadmin', 'editor'].includes(req.user.role) ||
      article.author.toString() === req.user._id.toString();
    if (!canEdit) return sendError(res, { statusCode: 403, message: 'Access denied' });

    // Strip fields that must never be overwritten via PATCH
    const { author, slug, views, likes, shares, commentsCount,
      editHistory, createdAt, updatedAt, __v, ...safeBody } = req.body;

    // ✅ safeBody is now declared — contributor publish-gate goes HERE
    if (req.user.role === 'contributor' && safeBody.status === 'published') {
      return sendError(res, { statusCode: 403, message: 'Contributors cannot publish directly. Submit for review.' });
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
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });
    return sendSuccess(res, { message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Upload Featured Image ─────────────────────────────────────────────────────
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, { statusCode: 400, message: 'No image uploaded' });

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

    // Only author, editor, or admin can view
    const canView = ['admin', 'superadmin', 'editor'].includes(req.user.role) ||
      article.author._id.toString() === req.user._id.toString();
    if (!canView) return sendError(res, { statusCode: 403, message: 'Access denied' });

    return sendSuccess(res, { data: { article } });
  } catch (err) {
    next(err);
  }
};

// ── Admin: All Articles (with any status) ─────────────────────────────────────
exports.adminGetArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, author, category, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (author) filter.author = author;
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

// ── Increment Views (public, fire-and-forget) ─────────────────────────────────
exports.incrementViews = async (req, res, next) => {
  try {
    // Accept slug or id
    const filter = req.params.slug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: req.params.slug }
      : { slug: req.params.slug };
    await Article.findOneAndUpdate(filter, { $inc: { views: 1 } });
    return res.status(204).end();
  } catch (err) {
    next(err);
  }
};
