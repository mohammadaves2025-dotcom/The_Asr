const Article = require('../models/Article');
const logger  = require('../utils/logger');

/**
 * Finds all scheduled articles whose scheduledFor time has passed
 * and publishes them. Run this on an interval from server.js.
 */
const publishScheduledArticles = async () => {
  try {
    const now = new Date();
    const result = await Article.updateMany(
      { status: 'scheduled', scheduledFor: { $lte: now } },
      { $set: { status: 'published', publishedAt: now } }
    );
    if (result.modifiedCount > 0) {
      logger.info(`Scheduler: published ${result.modifiedCount} scheduled article(s)`);
    }
  } catch (err) {
    logger.error(`Scheduler error: ${err.message}`);
  }
};

module.exports = publishScheduledArticles;