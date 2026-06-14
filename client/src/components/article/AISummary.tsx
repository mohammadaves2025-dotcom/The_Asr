// client/src/components/article/AISummary.tsx
//
// Renders a "Read in 30 seconds" collapsible box at the top of every article.
// Calls the backend /api/v1/ai/assist proxy (public-facing endpoint — see note).
//
// NOTE ON AUTH: The /api/v1/ai/assist route currently requires contributor+.
// For the public-facing summary we call a new public endpoint /api/v1/ai/summary
// added in ai.js (see backend patch below).  If you prefer to keep it behind auth,
// wrap this component in a conditional and only render for signed-in users.

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

// Plain client for public AI endpoints — deliberately bypasses the auth
// interceptors on the shared `api` instance (no Authorization header,
// no token-refresh-on-401, no redirect-to-login for anonymous readers).
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
const publicApi = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

interface Props {
  title:   string;
  excerpt: string;
  body:    string;   // raw HTML — we strip tags before sending
  slug:    string;   // used as cache key in sessionStorage
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function AISummary({ title, excerpt, body, slug }: Props) {
  const [bullets,   setBullets]   = useState<string[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(false);
  const [expanded,  setExpanded]  = useState(true);

  useEffect(() => {
    // Cache summary per article slug in sessionStorage — avoids repeat API calls
    const cacheKey = `ai_summary_${slug}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try { setBullets(JSON.parse(cached)); return; } catch {}
    }

    const bodyText = stripHtml(body).slice(0, 2500);
    if (!bodyText || bodyText.length < 100) return;

    setLoading(true);
    setError(false);

    // Use the public summary endpoint (no auth required)
    publicApi
      .post('/ai/summary', {
        title,
        excerpt,
        bodyText,
      })
      .then((res) => {
        const text: string = res.data?.summary ?? '';
        let parsed: string[] = [];
        try {
          const cleaned = text.replace(/```json|```/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          parsed = text
            .split('\n')
            .map((l: string) => l.replace(/^[-•*\d.)\s]+/, '').trim())
            .filter(Boolean);
        }
        if (parsed.length) {
          setBullets(parsed.slice(0, 4));
          sessionStorage.setItem(cacheKey, JSON.stringify(parsed.slice(0, 4)));
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Don't render the box at all until we have bullets (or are loading)
  if (!loading && !error && bullets.length === 0) return null;

  return (
    <div className="border-l-4 border-brand-navy bg-surface-secondary mb-8 overflow-hidden rounded-xl">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-brand-navy flex-shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-[2px] text-brand-navy font-sans">
            Read in 30 Seconds
          </span>
          <span className="text-[9px] text-ink-muted font-sans ml-1">AI Summary</span>
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-ink-muted flex-shrink-0" />
        ) : (
          <ChevronDown size={14} className="text-ink-muted flex-shrink-0" />
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4">
          {loading && (
            <div className="flex items-center gap-2 text-[12px] text-ink-muted font-sans py-2">
              <Loader2 size={13} className="animate-spin text-brand-navy" />
              Generating summary…
            </div>
          )}

          {error && (
            <p className="text-[11px] text-ink-muted font-sans py-2">
              Summary unavailable for this article.
            </p>
          )}

          {!loading && !error && bullets.length > 0 && (
            <ul className="space-y-2 mt-1">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full bg-brand-navy text-brand-yellow text-[9px] font-black flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-ink-secondary font-sans leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-[9px] text-ink-faint font-sans mt-3 border-t border-gray-200 pt-2">
            AI-generated summary · Always read the full article for complete context
          </p>
        </div>
      )}
    </div>
  );
}