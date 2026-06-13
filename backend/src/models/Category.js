const mongoose = require('mongoose');
const slugify = require('slug');

const CATEGORY_COLORS = [
  '#c8392b', '#1a5c38', '#1d3557', '#7c3aed',
  '#b45309', '#0e7490', '#be123c', '#065f46',
];

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [80, 'Category name cannot exceed 80 characters'],
    },
    slug: { type: String, lowercase: true },
    description: { type: String, maxlength: 500 },
    color: { type: String, default: '#122837' },
    icon: { type: String }, // icon class or emoji
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false }, // true = show in primary navbar
    showInMore: { type: Boolean, default: false },  // true = show in More dropdown
    order: { type: Number, default: 0 }, // for nav ordering
    seo: {
      metaTitle: String,
      metaDescription: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, order: 1 });

categorySchema.virtual('articleCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
