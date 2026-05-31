const mongoose = require('mongoose');
const logger = require('../utils/logger');

// ── Serverless connection cache ────────────────────────────────────────────────
// In serverless (Vercel) each invocation may reuse a warm Lambda container.
// We cache the connection promise so we don't open a new pool every request.
let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      tls: true,
      tlsAllowInvalidCertificates: true,
      bufferCommands: false,
    }).then(m => {
      logger.info(`MongoDB connected: ${m.connection.host}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }

  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
  cached.conn = null;
  cached.promise = null;
});

module.exports = connectDB;
