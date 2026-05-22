const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const ROLES = ['subscriber', 'contributor', 'editor', 'admin', 'superadmin'];

const userSchema = new mongoose.Schema(
  {
    // ── Core Identity ──────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // never returned by default
    },

    // ── OAuth ──────────────────────────────────────────────────────────────
    googleId: { type: String },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },

    // ── Profile ────────────────────────────────────────────────────────────
    avatar: { type: String },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    designation: { type: String, maxlength: 100 }, // e.g. "Senior Correspondent"
    socialLinks: {
      twitter: String,
      linkedin: String,
      website: String,
    },

    // ── Role & Permissions ─────────────────────────────────────────────────
    role: { type: String, enum: ROLES, default: 'subscriber' },
    permissions: [{ type: String }], // for fine-grained overrides

    // ── Auth & Security ────────────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        userAgent: String,
        ip: String,
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerifyToken: String,
    emailVerifyExpires: Date,
    lastLogin: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    // ── Preferences ────────────────────────────────────────────────────────
    newsletterSubscribed: { type: Boolean, default: false },
    savedArticles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }],
    followedCategories: [String],
    followedAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// ── Virtuals ─────────────────────────────────────────────────────────────────
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('articlesCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'author',
  count: true,
});

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Methods ───────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

userSchema.methods.createEmailVerifyToken = function () {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

userSchema.methods.incLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // lock 15 min
  }
  return this.updateOne(updates);
};

userSchema.methods.addRefreshToken = async function (token, userAgent, ip) {
  // Keep max 5 sessions per user
  if (this.refreshTokens.length >= 5) this.refreshTokens.shift();
  this.refreshTokens.push({ token, userAgent, ip });
  return this.save();
};

userSchema.methods.removeRefreshToken = async function (token) {
  this.refreshTokens = this.refreshTokens.filter((t) => t.token !== token);
  return this.save();
};

// ── Statics ───────────────────────────────────────────────────────────────────
userSchema.statics.ROLES = ROLES;

const User = mongoose.model('User', userSchema);
module.exports = User;
