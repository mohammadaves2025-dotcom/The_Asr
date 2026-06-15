// client/src/components/article/TranslationToggle.tsx
//
// Renders a language switcher strip: [EN] [हिन्दी] [اُردُو]
// When Hindi or Urdu is selected, calls the backend AI proxy to translate
// title, excerpt, AND body. Shows a clear "AI Translation" badge.

import { useState } from 'react';
import axios from 'axios';
import { Languages, Loader2, AlertCircle } from 'lucide-react';

// Plain client for public AI endpoints — bypasses auth interceptors
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';
const publicApi = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } });

type Lang = 'en' | 'hi' | 'ur';

interface Translation {
  title:   string;
  excerpt: string;
  body:    string;
}

interface Props {
  originalTitle:   string;
  originalExcerpt: string;
  originalBody:    string;
  articleId:       string;
  articleSlug:     string;
  /** Called when language changes so the parent (ArticlePage) can update displayed content */
  onTranslate: (lang: Lang, translation: Translation | null) => void;
}

const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  hi: 'हिन्दी',
  ur: 'اُردُو',
};

const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  hi: 'Hindi',
  ur: 'Urdu',
};

export default function TranslationToggle({
  originalTitle,
  originalExcerpt,
  originalBody,
  articleId,
  articleSlug,
  onTranslate,
}: Props) {
  const [activeLang,  setActiveLang]  = useState<Lang>('en');
  const [loading,     setLoading]     = useState<Lang | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  // Cache translations in memory for the session (fallback when DB cache misses)
  const [cache,       setCache]       = useState<Partial<Record<Lang, Translation>>>({});

  const handleSelect = async (lang: Lang) => {
    if (lang === activeLang) return;
    setError(null);

    // Switch back to English — no API call needed
    if (lang === 'en') {
      setActiveLang('en');
      onTranslate('en', null);
      return;
    }

    // Already fetched this session — use in-memory cache
    if (cache[lang]) {
      setActiveLang(lang);
      onTranslate(lang, cache[lang]!);
      return;
    }

    // Fetch translation (backend will check DB cache first)
    setLoading(lang);
    try {
      const res = await publicApi.post('/ai/translate', {
        title:     originalTitle,
        excerpt:   originalExcerpt,
        body:      originalBody,
        language:  lang === 'hi' ? 'Hindi' : 'Urdu',
        articleId,
        slug:      articleSlug,
      });

      const translation: Translation = res.data?.translation;
      if (translation?.title && translation?.excerpt) {
        setCache((prev) => ({ ...prev, [lang]: translation }));
        setActiveLang(lang);
        onTranslate(lang, translation);
      } else {
        throw new Error('Empty response');
      }
    } catch {
      setError(`Translation to ${LANG_NAMES[lang]} failed. Please try again.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center flex-wrap gap-3 mb-6">
      {/* Language buttons */}
      <div className="flex items-center gap-1 border border-gray-200 p-0.5 rounded-lg">
        {(Object.keys(LANG_LABELS) as Lang[]).map((lang) => (
          <button
            key={lang}
            onClick={() => handleSelect(lang)}
            disabled={loading !== null}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold font-sans transition-all
              disabled:opacity-60 disabled:cursor-not-allowed
              ${activeLang === lang
                ? 'bg-brand-navy text-brand-yellow'
                : 'text-ink-muted hover:text-brand-navy hover:bg-surface-secondary'
              }
            `}
          >
            {loading === lang ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <Languages size={10} />
            )}
            {LANG_LABELS[lang]}
          </button>
        ))}
      </div>

      {/* AI badge — only show for non-English */}
      {activeLang !== 'en' && (
        <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[1.5px] px-2 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-sans rounded-full">
          <AlertCircle size={9} /> AI Translation — may not be fully accurate
        </span>
      )}

      {/* Error */}
      {error && (
        <p className="w-full text-[11px] text-red-500 font-sans mt-1">{error}</p>
      )}
    </div>
  );
}