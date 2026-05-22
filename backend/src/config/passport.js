const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const logger = require('../utils/logger');

// ─── JWT STRATEGY ────────────────────────────────────────────────────────────
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET,
};

passport.use(
  'jwt',
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await User.findById(payload.sub).select('-password -refreshTokens');
      if (!user || !user.isActive) return done(null, false);
      return done(null, user);
    } catch (err) {
      logger.error('JWT strategy error:', err);
      return done(err, false);
    }
  })
);

// ─── GOOGLE OAUTH STRATEGY ───────────────────────────────────────────────────
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), false);

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            avatar: profile.photos?.[0]?.value,
            googleId: profile.id,
            provider: 'google',
            isVerified: true, // Google emails are pre-verified
            role: 'subscriber',
          });
          logger.info(`New user via Google OAuth: ${email}`);
        } else if (!user.googleId) {
          // Link Google to existing account
          user.googleId = profile.id;
          user.isVerified = true;
          if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
          await user.save();
        }

        if (!user.isActive) return done(null, false, { message: 'Account deactivated' });
        return done(null, user);
      } catch (err) {
        logger.error('Google strategy error:', err);
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
