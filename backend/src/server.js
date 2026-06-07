// server.js — local development entry point only
// On Vercel, vercel.json points directly to app.js
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 The Orbis Journal API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`📍 http://localhost:${PORT}/health`);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
