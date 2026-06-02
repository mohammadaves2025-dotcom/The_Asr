#!/usr/bin/env node
/**
 * import_articles.js
 *
 * Bulk-imports test_articles.json into The Asr backend.
 *
 * Usage:
 *   node import_articles.js
 *
 * Config (edit the three lines below, or set as env vars):
 *   API_URL   — your backend base URL  (default: http://localhost:5000/api/v1)
 *   ADMIN_EMAIL / ADMIN_PASSWORD — any admin/editor account credentials
 */

const fs   = require('fs');
const path = require('path');
const http = require('https'); // node built-in, works for both http & https

// ── Config ────────────────────────────────────────────────────────────────────

const API_URL       = process.env.API_URL       || 'http://localhost:5000/api/v1';
const ADMIN_EMAIL   = process.env.ADMIN_EMAIL   || 'admin@theasr.com';      // ← change
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';      // ← change

// Path to the articles JSON (same directory as this script by default)
const ARTICLES_FILE = path.join(__dirname, 'test_articles.json');

// ── Tiny fetch wrapper (no dependencies needed) ───────────────────────────────

function request(method, url, body, token) {
  return new Promise((resolve, reject) => {
    const parsed   = new URL(url);
    const isHttps  = parsed.protocol === 'https:';
    const lib      = isHttps ? require('https') : require('http');
    const payload  = body ? JSON.stringify(body) : null;

    const options = {
      hostname : parsed.hostname,
      port     : parsed.port || (isHttps ? 443 : 80),
      path     : parsed.pathname + parsed.search,
      method,
      headers  : {
        'Content-Type': 'application/json',
        ...(payload  && { 'Content-Length': Buffer.byteLength(payload) }),
        ...(token    && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function green(s)  { return `\x1b[32m${s}\x1b[0m`; }
function red(s)    { return `\x1b[31m${s}\x1b[0m`; }
function yellow(s) { return `\x1b[33m${s}\x1b[0m`; }
function bold(s)   { return `\x1b[1m${s}\x1b[0m`; }
function dim(s)    { return `\x1b[2m${s}\x1b[0m`; }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + bold('━━━ The Asr — Article Importer ━━━') + '\n');
  console.log(dim(`API: ${API_URL}`));
  console.log(dim(`File: ${ARTICLES_FILE}\n`));

  // ── 1. Read articles file ──────────────────────────────────────────────────

  if (!fs.existsSync(ARTICLES_FILE)) {
    console.error(red(`✗ File not found: ${ARTICLES_FILE}`));
    process.exit(1);
  }

  let articles;
  try {
    articles = JSON.parse(fs.readFileSync(ARTICLES_FILE, 'utf8'));
  } catch (e) {
    console.error(red(`✗ Failed to parse JSON: ${e.message}`));
    process.exit(1);
  }

  console.log(green(`✓ Loaded ${articles.length} articles from file\n`));

  // ── 2. Login ───────────────────────────────────────────────────────────────

  process.stdout.write(`Logging in as ${ADMIN_EMAIL}… `);
  const loginRes = await request('POST', `${API_URL}/auth/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  if (loginRes.status !== 200 || !loginRes.body?.data?.accessToken) {
    console.log(red('FAILED'));
    console.error(red(`  Status: ${loginRes.status}`));
    console.error(red(`  Message: ${loginRes.body?.message || 'Unknown error'}`));
    console.error('\nCheck ADMIN_EMAIL and ADMIN_PASSWORD at the top of this script.');
    process.exit(1);
  }

  const token = loginRes.body.data.accessToken;
  console.log(green('OK'));

  // ── 3. Fetch categories ────────────────────────────────────────────────────

  process.stdout.write('Fetching categories… ');
  const catRes = await request('GET', `${API_URL}/categories`, null, token);

  if (catRes.status !== 200) {
    console.log(red('FAILED'));
    console.error(red(`  Could not fetch categories: ${catRes.status}`));
    process.exit(1);
  }

  const categories = catRes.body?.data?.data?.categories || catRes.body?.data?.categories || [];
  console.log(green(`OK (${categories.length} found)`));

  if (categories.length === 0) {
    console.warn(yellow('\n⚠ No categories found. Articles will be imported without a category.'));
    console.warn(yellow('  Create at least one category in the admin panel first for best results.\n'));
  } else {
    console.log(dim('  Available: ' + categories.map(c => c.name).join(', ') + '\n'));
  }

  // Build a lookup: lowercase name → _id
  const catMap = {};
  categories.forEach(c => {
    catMap[c.name.toLowerCase()] = c._id;
    catMap[c.slug]               = c._id;
  });

  // Pick a fallback (first category) for articles with no match
  const fallbackCategoryId = categories[0]?._id || null;

  // ── 4. Import articles one by one ─────────────────────────────────────────

  console.log(bold('Importing articles…\n'));

  const results = { ok: 0, skipped: 0, failed: 0 };

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const num     = `[${String(i + 1).padStart(2, '0')}/${articles.length}]`;
    const label   = article.title?.slice(0, 65) || '(no title)';

    // Resolve category
    let categoryId = null;

    // Try the categoryId field directly (if present and looks like a MongoDB ID)
    if (article.categoryId && /^[a-f\d]{24}$/i.test(article.categoryId)) {
      categoryId = article.categoryId;
    }
    // Try matching by name from categories we fetched
    else if (categories.length > 0) {
      // Try exact match on content type or a generic guess
      const guesses = [
        article.contentType,
        article.contentType?.replace(/-/g, ' '),
        'news',
        'general',
        'india',
        categories[0]?.slug,
      ].filter(Boolean).map(s => s.toLowerCase());

      for (const guess of guesses) {
        if (catMap[guess]) {
          categoryId = catMap[guess];
          break;
        }
      }

      // Last resort: just use the first category
      if (!categoryId) categoryId = fallbackCategoryId;
    }

    if (!categoryId) {
      console.log(`  ${num} ${yellow('SKIP')} ${dim(label)}`);
      console.log(dim('       No category available — create one in admin first'));
      results.skipped++;
      continue;
    }

    // Build clean payload (strip import-only fields)
    const { categoryId: _cid, tagsInput, ...rest } = article;

    const payload = {
      ...rest,
      category: categoryId,
      // If tagsInput exists (comma string), convert it; otherwise keep tags array
      tags: tagsInput
        ? tagsInput.split(',').map(t => t.trim()).filter(Boolean)
        : (article.tags || []),
    };

    // Remove undefined/null values that might trip validators
    Object.keys(payload).forEach(k => {
      if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
        delete payload[k];
      }
    });

    process.stdout.write(`  ${num} ${dim(label.padEnd(67))} `);

    try {
      const res = await request('POST', `${API_URL}/articles`, payload, token);

      if (res.status === 201) {
        const slug = res.body?.data?.article?.slug || '';
        console.log(green('✓') + dim(slug ? ` /${slug}` : ''));
        results.ok++;
      } else {
        const msg = res.body?.message || res.body?.error || `HTTP ${res.status}`;
        console.log(red('✗') + ` ${msg}`);
        results.failed++;
      }
    } catch (err) {
      console.log(red('✗') + ` ${err.message}`);
      results.failed++;
    }

    // Small delay to avoid hammering the server
    await sleep(200);
  }

  // ── 5. Summary ─────────────────────────────────────────────────────────────

  console.log('\n' + bold('━━━ Done ━━━'));
  console.log(green(`  ✓ Imported : ${results.ok}`));
  if (results.skipped) console.log(yellow(`  ⚠ Skipped  : ${results.skipped}`));
  if (results.failed)  console.log(red   (`  ✗ Failed   : ${results.failed}`));
  console.log('');

  if (results.failed > 0) {
    console.log(dim('Tip: re-run with NODE_DEBUG=1 for full error bodies.'));
  }
  if (results.skipped > 0) {
    console.log(dim('Tip: create categories in the admin panel, then re-run.'));
  }
}

main().catch(err => {
  console.error(red('\nUnexpected error: ') + err.message);
  process.exit(1);
});
