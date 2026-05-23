const jwt = require('jsonwebtoken');

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { sub: userId, role, type: 'access' },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  );
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const generateTokenPair = (userId, role) => ({
  accessToken: generateAccessToken(userId, role),
  refreshToken: generateRefreshToken(userId),
});

const setRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    // lax (not strict) so cross-port requests from admin panel still send the cookie
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth/refresh',
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    path: '/api/v1/auth/refresh',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenPair,
  setRefreshCookie,
  clearRefreshCookie,
};
