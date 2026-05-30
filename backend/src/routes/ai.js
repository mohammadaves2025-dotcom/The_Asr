const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

/**
 * POST /api/v1/ai/assist
 * Proxies requests to the Anthropic API so the key stays server-side.
 * Only accessible to authenticated contributors/editors/admins.
 */
router.post(
  '/assist',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const { model, max_tokens, messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, message: 'messages array is required' });
      }

      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ success: false, message: 'AI service not configured' });
      }

      const upstream = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model || 'claude-sonnet-4-20250514',
          max_tokens: max_tokens || 1000,
          messages,
        }),
      });

      const data = await upstream.json();

      if (!upstream.ok) {
        return res.status(upstream.status).json({ success: false, message: data.error?.message || 'AI request failed' });
      }

      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
