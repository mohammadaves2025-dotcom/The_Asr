const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../middleware/validators');
const { authLimiter, registerLimiter, passwordResetLimiter, refreshLimiter } = require('../middleware/rateLimiter');

// ── Local Auth ────────────────────────────────────────────────────────────────
router.post('/register', registerLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh', refreshLimiter, authController.refreshToken);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  authController.googleCallback
);

// ── Password ──────────────────────────────────────────────────────────────────
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, authController.forgotPassword);
router.patch('/reset-password/:token', resetPasswordValidator, authController.resetPassword);
router.patch('/update-password', protect, authController.updatePassword);

// ── Profile ───────────────────────────────────────────────────────────────────
router.get('/me', protect, authController.getMe);

module.exports = router;
