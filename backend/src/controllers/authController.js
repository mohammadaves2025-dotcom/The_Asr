const crypto = require('crypto');
const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken, setRefreshCookie, clearRefreshCookie } = require('../utils/tokens');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');
const logger = require('../utils/logger');

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, { statusCode: 409, message: 'Email already registered' });

    // Public registration always creates a subscriber — role cannot be supplied by the client
    const user = await User.create({ name, email, password, role: 'subscriber', provider: 'local' });

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);
    await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);

    setRefreshCookie(res, refreshToken);

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch((e) => logger.error('Welcome email failed:', e));

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Account created successfully',
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return sendError(res, { statusCode: 401, message: 'Invalid credentials' });

    if (user.isLocked) {
      return sendError(res, { statusCode: 423, message: 'Account temporarily locked due to too many failed attempts' });
    }

    if (!user.password) {
      return sendError(res, { statusCode: 400, message: 'Please sign in with Google — no password set for this account' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return sendError(res, { statusCode: 401, message: 'Invalid credentials' });
    }

    if (!user.isActive) return sendError(res, { statusCode: 403, message: 'Account deactivated' });

    // Reset login attempts on success
    if (user.loginAttempts > 0) {
      await user.updateOne({ $set: { loginAttempts: 0 }, $unset: { lockUntil: 1 } });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);
    await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);
    setRefreshCookie(res, refreshToken);

    return sendSuccess(res, {
      message: 'Login successful',
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── Refresh Token ─────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return sendError(res, { statusCode: 401, message: 'Refresh token missing' });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return sendError(res, { statusCode: 401, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return sendError(res, { statusCode: 401, message: 'User not found' });

    // Verify token is in user's whitelist (rotation check)
    const tokenExists = user.refreshTokens.some((t) => t.token === token);
    if (!tokenExists) {
      // Possible token reuse — invalidate all sessions
      user.refreshTokens = [];
      await user.save();
      return sendError(res, { statusCode: 401, message: 'Token reuse detected — all sessions invalidated' });
    }

    // Rotate tokens
    await user.removeRefreshToken(token);
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.role);
    await user.addRefreshToken(newRefreshToken, req.headers['user-agent'], req.ip);
    setRefreshCookie(res, newRefreshToken);

    return sendSuccess(res, { data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token && req.user) {
      await req.user.removeRefreshToken(token);
    }
    clearRefreshCookie(res);
    return sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ── Google OAuth callback ─────────────────────────────────────────────────────
exports.googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role);
    await user.addRefreshToken(refreshToken, req.headers['user-agent'], req.ip);
    setRefreshCookie(res, refreshToken);

    // Redirect to frontend with access token in query (frontend stores it)
    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&role=${user.role}`;
    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

// ── Get current user ──────────────────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedArticles', 'title slug featuredImage publishedAt')
      .populate('followedAuthors', 'name avatar');
    return sendSuccess(res, { data: { user } });
  } catch (err) {
    next(err);
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always return 200 to prevent email enumeration
    if (!user) return sendSuccess(res, { message: 'If that email exists, a reset link has been sent' });

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    return sendSuccess(res, { message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    next(err);
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return sendError(res, { statusCode: 400, message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    return sendSuccess(res, { message: 'Password reset successful — please log in' });
  } catch (err) {
    next(err);
  }
};

// ── Update Password ───────────────────────────────────────────────────────────
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!(await user.comparePassword(currentPassword))) {
      return sendError(res, { statusCode: 401, message: 'Current password incorrect' });
    }

    user.password = newPassword;
    user.refreshTokens = []; // invalidate all sessions
    await user.save();

    clearRefreshCookie(res);

    return sendSuccess(res, { message: 'Password updated successfully — please log in again' });
  } catch (err) {
    next(err);
  }
};
