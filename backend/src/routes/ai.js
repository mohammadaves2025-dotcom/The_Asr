// backend/src/routes/ai.js
//
// Three endpoints:
//   POST /api/v1/ai/assist      — admin/editor only, used by the admin AI drawer
//   POST /api/v1/ai/summary     — public, used by AISummary.tsx on article pages
//   POST /api/v1/ai/translate   — public, used by TranslationToggle.tsx on article pages
//
// All three proxy to Google Gemini so the API key never touches the client.

const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { aiPublicLimiter } = require('../middleware/rateLimiter');

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite';

// ── Shared helper ─────────────────────────────────────────────────────────────
// Converts Anthropic-style { role, content } messages into Gemini's
// { role, parts: [{ text }] } format and calls generateContent.
// Retries once on transient overload (503 / "high demand"), falling back to a
// lighter model if the primary is still saturated.
async function callGeminiModel(model, messages, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('AI service not configured');

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: maxTokens },
      }),
    }
  );

  const data = await upstream.json();
  if (!upstream.ok) {
    const err = new Error(data.error?.message || 'AI request failed');
    err.status = upstream.status;
    throw err;
  }

  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
}

function isOverloaded(err) {
  return err.status === 503 || /overloaded|high demand|unavailable/i.test(err.message || '');
}

async function callGemini(messages, maxTokens = 800) {
  try {
    return await callGeminiModel(GEMINI_MODEL, messages, maxTokens);
  } catch (err) {
    if (isOverloaded(err)) {
      // Primary model overloaded — retry once on the lighter fallback model.
      try {
        return await callGeminiModel(GEMINI_FALLBACK_MODEL, messages, maxTokens);
      } catch (fallbackErr) {
        if (isOverloaded(fallbackErr)) {
          // One short retry on the original model before giving up.
          await new Promise((r) => setTimeout(r, 800));
          return await callGeminiModel(GEMINI_MODEL, messages, maxTokens);
        }
        throw fallbackErr;
      }
    }
    throw err;
  }
}

// ── 1. Admin AI assistant (existing — unchanged behaviour, new provider) ──────
router.post(
  '/assist',
  protect,
  authorize('contributor', 'editor', 'admin', 'superadmin'),
  async (req, res, next) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, message: 'messages array is required' });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ success: false, message: 'AI service not configured' });
      }

      const text = await callGemini(messages, 1000);

      // Shape response like Anthropic's { content: [{ type: 'text', text }] }
      // so existing admin frontend code (admin.ts / AI drawer) keeps working unchanged.
      return res.json({
        content: [{ type: 'text', text }],
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── 2. Article summary (public — no auth required) ───────────────────────────
// Used by AISummary.tsx to generate "Read in 30 seconds" bullet points.
// aiPublicLimiter: 20 req / hour per IP — tighter than the global 100/15min.
router.post('/summary', aiPublicLimiter, async (req, res, next) => {
  try {
    const { title, excerpt, bodyText } = req.body;
    if (!title || !bodyText) {
      return res.status(400).json({ success: false, message: 'title and bodyText are required' });
    }

    const prompt = `You are an editorial assistant for The Orbis Journal, an independent human rights news publication.

Summarize the following article in exactly 3 concise bullet points (each under 20 words).
Each bullet should capture a distinct key fact or development from the article.
Return ONLY a JSON array of 3 strings. No preamble, no markdown, no commentary.

Article Title: ${title}
Excerpt: ${excerpt || ''}
Body: ${bodyText.slice(0, 2500)}`;

    const text = await callGemini([{ role: 'user', content: prompt }], 400);

    let summary = [];
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      summary = JSON.parse(cleaned);
    } catch {
      summary = text
        .split('\n')
        .map((l) => l.replace(/^[-•*\d.)\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    return res.json({ success: true, summary: JSON.stringify(summary) });
  } catch (err) {
    next(err);
  }
});

// ── 3. Article translation (public — no auth required) ───────────────────────
// Used by TranslationToggle.tsx to translate title + excerpt + body.
// aiPublicLimiter: 20 req / hour per IP — tighter than the global 100/15min.
//
// Flow:
//   1. If articleId provided → check Article.aiTranslations[langCode] in DB.
//   2. On cache hit → return immediately (no Gemini call).
//   3. On cache miss → call Gemini for title + excerpt + body, write to DB, return.
router.post('/translate', aiPublicLimiter, async (req, res, next) => {
  try {
    const { title, excerpt, body, language, articleId } = req.body;

    if (!title || !language) {
      return res.status(400).json({ success: false, message: 'title and language are required' });
    }

    // Only Hindi and Urdu supported in phase 1
    const LANG_MAP = { Hindi: 'hi', Urdu: 'ur' };
    const supported = Object.keys(LANG_MAP);
    if (!supported.includes(language)) {
      return res.status(400).json({ success: false, message: `Language must be one of: ${supported.join(', ')}` });
    }

    const langCode = LANG_MAP[language]; // 'hi' | 'ur'

    // ── DB cache check ──────────────────────────────────────────────────────
    if (articleId) {
      const Article = require('../models/Article');
      const cached = await Article.findById(articleId)
        .select(`aiTranslations.${langCode}`)
        .lean();

      const hit = cached?.aiTranslations?.[langCode];
      if (hit?.title && hit?.excerpt) {
        return res.json({
          success: true,
          fromCache: true,
          translation: { title: hit.title, excerpt: hit.excerpt, body: hit.body || '' },
        });
      }
    }

    // ── Build prompt ────────────────────────────────────────────────────────
    const hasBody = body && body.trim().length > 0;

    const prompt = `You are a professional translator for an Indian human rights news publication.

Translate the following article fields from English to ${language}.
The translation must be accurate, natural, and journalistically appropriate.
Preserve proper nouns (names, places, laws) as they are.
For the body field, preserve all HTML tags exactly — translate only the visible text content inside tags.

Return ONLY a JSON object with exactly these keys: "title", "excerpt"${hasBody ? ', "body"' : ''}.
No markdown, no explanation, no extra keys.

Title: ${title}
Excerpt: ${excerpt || title}${hasBody ? `\nBody (HTML): ${body.slice(0, 6000)}` : ''}`;

    const text = await callGemini([{ role: 'user', content: prompt }], hasBody ? 4000 : 600);

    let translation = null;
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      translation = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ success: false, message: 'Translation parsing failed' });
    }

    if (!translation?.title || !translation?.excerpt) {
      return res.status(502).json({ success: false, message: 'Incomplete translation response' });
    }

    // ── Write to DB cache ───────────────────────────────────────────────────
    if (articleId) {
      try {
        const Article = require('../models/Article');
        await Article.findByIdAndUpdate(articleId, {
          $set: {
            [`aiTranslations.${langCode}`]: {
              title:     translation.title,
              excerpt:   translation.excerpt,
              body:      translation.body || '',
              createdAt: new Date(),
            },
          },
        });
      } catch (cacheErr) {
        // Non-fatal — log but still return translation to the user
        console.error('[ai/translate] DB cache write failed:', cacheErr.message);
      }
    }

    return res.json({
      success: true,
      fromCache: false,
      translation: {
        title:   translation.title,
        excerpt: translation.excerpt,
        body:    translation.body || '',
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;