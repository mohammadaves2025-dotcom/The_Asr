// app.js — pure Express app exported for both Vercel serverless and local dev
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

const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const aiRoutes = require('./routes/ai');
const {
  categoryRouter, commentRouter, adminCommentRouter,
  newsletterRouter, submissionRouter, userRouter,
  statsRouter,
} = require('./routes/index');

const app = express();

// ── Ensure DB is connected on every serverless invocation ─────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(hpp());
app.use(xssSanitize);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL  || 'http://localhost:3000',
  process.env.ADMIN_URL   || 'http://localhost:5174',
].filter(Boolean).map(o => o.replace(/\/$/, '')); // strip trailing slashes

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl
    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(clean)) return cb(null, true);
    console.error('[CORS BLOCKED]', origin, '| Allowed:', allowedOrigins);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

app.use(passport.initialize());

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'ok',
  env: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
}));

// ── Vercel Cron: publish scheduled articles ────────────────────────────────────

const publishScheduledArticles = require('./jobs/publishScheduled');
app.get('/api/v1/internal/publish-scheduled', async (req, res) => {
  const cronSecret = req.headers['authorization'];
  if (!process.env.CRON_SECRET || cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await publishScheduledArticles();
  res.json({ ok: true, time: new Date().toISOString() });
});

// ── API routes ─────────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

const API = '/api/v1';
app.use(`${API}/auth`,                          authRoutes);
app.use(`${API}/ai`,                            aiRoutes);
app.use(`${API}/articles`,                      articleRoutes);
app.use(`${API}/articles/:articleId/comments`,  commentRouter);
app.use(`${API}/comments/admin`,                adminCommentRouter);
app.use(`${API}/categories`,                    categoryRouter);
app.use(`${API}/newsletter`,                    newsletterRouter);
app.use(`${API}/submissions`,                   submissionRouter);
app.use(`${API}/users`,                         userRouter);
app.use(`${API}/admin/stats`,                   statsRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;