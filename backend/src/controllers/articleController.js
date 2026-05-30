const Article = require('../models/Article');
const Category = require('../models/Category');
const { sendSuccess, sendError, buildPaginationMeta } = require('../utils/apiResponse');

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
        .populate('author', 'name avatar designation')
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

// ── Get Single Article ────────────────────────────────────────────────────────
exports.getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug, status: 'published' })
      .populate('author', 'name avatar bio designation socialLinks')
      .populate('coAuthors', 'name avatar')
      .populate('category', 'name slug color')
      .populate('lastEditedBy', 'name');

    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    // Increment view count (fire and forget)
    Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } }).exec();

    // Fetch related articles
    const related = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      $or: [
        { category: article.category._id },
        { tags: { $in: article.tags } },
      ],
    })
      .limit(4)
      .sort('-publishedAt')
      .populate('author', 'name avatar')
      .populate('category', 'name slug color')
      .select('title slug excerpt featuredImage publishedAt readTime author category');

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
        .populate('author', 'name avatar')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category contentType'),

      // Editor's picks
      Article.find({ ...published, isEditorsPick: true })
        .sort('-publishedAt')
        .limit(4)
        .populate('author', 'name')
        .populate('category', 'name slug color')
        .select('title slug excerpt featuredImage publishedAt readTime author category'),

      // Latest 8 articles
      Article.find(published)
        .sort('-publishedAt')
        .limit(8)
        .populate('author', 'name')
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
        .populate('author', 'name avatar')
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

// ── Update Article ────────────────────────────────────────────────────────────
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return sendError(res, { statusCode: 404, message: 'Article not found' });

    // Only author, editor, or admin can edit
    const canEdit = ['admin', 'superadmin', 'editor'].includes(req.user.role) ||
      article.author.toString() === req.user._id.toString();
    if (!canEdit) return sendError(res, { statusCode: 403, message: 'Access denied' });

    // Track edit history
    article.editHistory.push({ editedBy: req.user._id, note: req.body.editNote });
    article.lastEditedBy = req.user._id;
    Object.assign(article, req.body);
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
    return sendSuccess(res, {
      data: { url: req.file.path, publicId: req.file.filename },
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
      .populate('lastEditedBy', 'name');

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
        .populate('author', 'name email')
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
