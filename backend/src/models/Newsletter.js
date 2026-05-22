const mongoose = require('mongoose');
const crypto = require('crypto');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    isConfirmed: { type: Boolean, default: false },
    confirmToken: String,
    confirmTokenExpires: Date,
    unsubscribeToken: {
      type: String,
      default: () => crypto.randomBytes(32).toString('hex'),
    },
    subscribedAt: Date,
    unsubscribedAt: Date,
    isActive: { type: Boolean, default: true },
    source: {
      type: String,
      enum: ['homepage', 'article', 'footer', 'popup', 'api'],
      default: 'homepage',
    },
    preferences: {
      frequency: { type: String, enum: ['daily', 'weekly'], default: 'weekly' },
      categories: [String],
    },
  },
  { timestamps: true }
);

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1, isConfirmed: 1 });
newsletterSchema.index({ unsubscribeToken: 1 });

newsletterSchema.methods.generateConfirmToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.confirmToken = crypto.createHash('sha256').update(token).digest('hex');
  this.confirmTokenExpires = Date.now() + 48 * 60 * 60 * 1000;
  return token;
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
module.exports = Newsletter;
