const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, can be anonymous
    name: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: ['one-time', 'monthly', 'annual'], default: 'one-time' },
    cause: {
      type: String,
      enum: ['general', 'fund-a-story', 'support-young-reporter', 'newsroom'],
      default: 'general',
    },
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' }, // for fund-a-story
    message: { type: String, maxlength: 500 },
    isAnonymous: { type: Boolean, default: false },

    // ── Payment ───────────────────────────────────────────────────────────
    paymentMethod: { type: String, enum: ['upi', 'card', 'netbanking', 'paypal', 'other'] },
    paymentId: String, // from payment gateway
    orderId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    receiptUrl: String,
    completedAt: Date,
  },
  { timestamps: true }
);

donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ donor: 1 });
donationSchema.index({ cause: 1 });

const Donation = mongoose.model('Donation', donationSchema);
module.exports = Donation;
