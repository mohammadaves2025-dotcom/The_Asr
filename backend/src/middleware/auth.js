const passport = require('passport');
const { sendError } = require('../utils/apiResponse');

/**
 * Require valid JWT access token
 */
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      const message =
        info?.name === 'TokenExpiredError'
          ? 'Access token expired'
          : info?.message || 'Authentication required';
      return sendError(res, { statusCode: 401, message });
    }
    req.user = user;
    next();
  })(req, res, next);
};

/**
 * Optional auth — attach user if token present, continue either way
 */
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) req.user = user;
    next();
  })(req, res, next);
};

/**
 * Role-based access control
 * Usage: authorize('admin', 'superadmin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, { statusCode: 401, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, {
        statusCode: 403,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

/**
 * Allow if user owns the resource OR has elevated role
 * Usage: ownerOrAdmin('userId') — field name on req.params
 */
const ownerOrAdmin = (paramField = 'id') => {
  return (req, res, next) => {
    const isOwner = req.user?._id.toString() === req.params[paramField];
    const isAdmin = ['admin', 'superadmin', 'editor'].includes(req.user?.role);
    if (!isOwner && !isAdmin) {
      return sendError(res, { statusCode: 403, message: 'Access denied' });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize, ownerOrAdmin };
