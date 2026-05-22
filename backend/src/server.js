require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const passport = require('./config/passport');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const xssSanitize = require('./middleware/sanitize');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const { categoryRouter, commentRouter, newsletterRouter, submissionRouter, userRouter } = require('./routes/index');

const app = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, // configure per-env if needed
}));
app.use(mongoSanitize());
app.use(hpp());
app.use(xssSanitize);

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Rate Limiting ─────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,         authRoutes);
app.use(`${API}/articles`,     articleRoutes);
app.use(`${API}/articles/:articleId/comments`, commentRouter);
app.use(`${API}/categories`,   categoryRouter);
app.use(`${API}/newsletter`,   newsletterRouter);
app.use(`${API}/submissions`,  submissionRouter);
app.use(`${API}/users`,        userRouter);

// ── 404 & Error Handler ───────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Maktoob API running on port ${PORT} [${process.env.NODE_ENV}]`);
  logger.info(`📍 http://localhost:${PORT}/health`);
});

// ── Unhandled Rejections ──────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

module.exports = app;
