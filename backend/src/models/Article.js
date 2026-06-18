const mongoose = require('mongoose');
const slugify = require('slug');

const ARTICLE_STATUSES = ['draft', 'review', 'scheduled', 'published', 'archived'];
const CONTENT_TYPES = [
  'news',             // Just In — general news articles
  'investigation',    // Investigation badge
  'opinion',          // Opinion & Analysis section
  'ground-report',    // Ground Report section
  'double-lens',      // Double Lens section
  'verified-report',  // ✓ Verified badge
  'photo-essay',      // Through the Lens section
  'explainer',        // Explainer badge
  'interview',        // Interview badge
  'community-voice',  // Community Voice badge
  'orbis-original',   // The Orbis Original section
  'features',         // Features / Editor's Pick section
];

const articleSchema = new mongoose.Schema(
  {
    // ── Core Content ──────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: { type: String, unique: true, lowercase: true },
    subtitle: { type: String, maxlength: 500 },
    excerpt: {
      type: String,
      required: [
        function () { return ['published', 'scheduled'].includes(this.status); },
        'Excerpt is required',
      ],
      maxlength: [1000, 'Excerpt cannot exceed 1000 characters'],
      default: '',
    },
    body: {
      type: String,
      required: [
        function () { return ['published', 'scheduled'].includes(this.status); },
        'Body content is required',
      ],
      default: '',
    }, // rich HTML from Quill/TipTap

    // ── Media ──────────────────────────────────────────────────────────────
    featuredImage: {
      url: String,
      publicId: String, // Cloudinary public_id for deletion
      alt: String,
      caption: String,
      credit: String,
    },
    gallery: [
      {
        url: String,
        publicId: String,
        alt: String,
        caption: String,
      },
    ],
    videoUrl: String, // YouTube/Vimeo embed URL

    // ── Taxonomy ──────────────────────────────────────────────────────────
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [
        function () { return ['published', 'scheduled'].includes(this.status); },
        'Category is required',
      ],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    contentType: {
      type: String,
      enum: CONTENT_TYPES,
      default: 'news',
    },
    series: { type: String, trim: true }, // e.g. "Voices from the Ground"
    seriesPart: Number,

    // ── Authorship ────────────────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isGuestAuthor: { type: Boolean, default: false },
    guestAuthorName: String,
    guestAuthorBio: String,

    // ── Publishing ────────────────────────────────────────────────────────
    status: { type: String, enum: ARTICLE_STATUSES, default: 'draft' },
    publishedAt: Date,
    scheduledFor: Date,
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editHistory: [
      {
        editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        editedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],

    // ── Flags & Badges ────────────────────────────────────────────────────
    isFeatured: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },

    isVerified: { type: Boolean, default: false }, // fact-checked badge
    isPremium: { type: Boolean, default: false },

    // ── Engagement Stats ──────────────────────────────────────────────────
    views: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 }, // in minutes, auto-calculated
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    // ── Location ──────────────────────────────────────────────────────────
    location: {
      state: String,
      district: String,
      country: { type: String, default: 'India' },
    },

    // ── Language ──────────────────────────────────────────────────────────
    language: { type: String, enum: ['en', 'ur', 'hi'], default: 'en' },
    translations: [
      {
        language: String,
        title: String,
        excerpt: String,
        body: String,
        slug: String,
      },
    ],

    // ── AI Translation Cache ───────────────────────────────────────────────
    // Keyed by language code ('hi' | 'ur'). Populated on first translate request
    // and served from DB on subsequent requests — avoids repeated Gemini calls.
    aiTranslations: {
      type: Map,
      of: new mongoose.Schema(
        {
          title:     { type: String, required: true },
          excerpt:   { type: String, required: true },
          body:      { type: String, default: '' },
          createdAt: { type: Date,   default: Date.now },
        },
        { _id: false }
      ),
      default: {},
    },

    // ── SEO ───────────────────────────────────────────────────────────────
    seo: {
      metaTitle: String,
      metaDescription: String,
      ogImage: String,
      keywords: [String],
      canonicalUrl: String,
    },

    // ── Corrections ───────────────────────────────────────────────────────
    corrections: [
      {
        note: String,
        correctedAt: { type: Date, default: Date.now },
        correctedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // ── Related Articles ──────────────────────────────────────────────────
    relatedArticles: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ isFeatured: 1 });
articleSchema.index({ isBreaking: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index(
  { title: 'text', excerpt: 'text', tags: 'text' },
  { weights: { title: 10, tags: 5, excerpt: 3 } }
);

// ── Pre-save ──────────────────────────────────────────────────────────────────
articleSchema.pre('save', async function (next) {
  // Auto-generate slug from title
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true }).substring(0, 80);
    let slug = baseSlug;
    let i = 1;
    while (await mongoose.model('Article').exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${i++}`;
    }
    this.slug = slug;
  }

  // Auto-calculate read time (avg 200 words/min)
  if (this.isModified('body')) {
    const wordCount = this.body.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200);
  }

  // Auto-clear previous breaking article when this one becomes breaking
  if (this.isModified('isBreaking') && this.isBreaking) {
    await mongoose.model('Article').updateMany(
      { isBreaking: true, _id: { $ne: this._id } },
      { isBreaking: false }
    );
  }

  // Auto-set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// ── Virtuals ──────────────────────────────────────────────────────────────────
articleSchema.virtual('isScheduled').get(function () {
  return this.status === 'scheduled' && this.scheduledFor > new Date();
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;