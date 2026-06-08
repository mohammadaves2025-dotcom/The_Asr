const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['tip', 'community-voice', 'letter-to-editor', 'youth-writer', 'correction', 'contact'],
      required: true,
    },
    // ── Submitter ─────────────────────────────────────────────────────────
    submitter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    isAnonymous: { type: Boolean, default: false },

    // ── Content ───────────────────────────────────────────────────────────
    subject: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 10000 },
    relatedArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
    location: String,
    attachments: [String], // URLs

    // ── Status ────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['new', 'under-review', 'accepted', 'rejected', 'published'],
      default: 'new',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: String,
    reviewedAt: Date,
    publishedArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'Article' },
  },
  { timestamps: true }
);

submissionSchema.index({ status: 1, type: 1, createdAt: -1 });
submissionSchema.index({ email: 1 });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;