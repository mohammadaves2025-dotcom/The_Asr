import { Link } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { Article } from '../../types';

// ── Content type label map — matches backend CONTENT_TYPES enum exactly ───────
const CONTENT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  'news':             { label: 'News',            color: 'bg-red-50 text-brand-red' },
  'investigation':    { label: 'Investigation',   color: 'bg-purple-50 text-purple-700' },
  'opinion':          { label: 'Opinion',         color: 'bg-blue-50 text-blue-800' },
  'analysis':         { label: 'Analysis',        color: 'bg-indigo-50 text-indigo-700' },
  'ground-report':    { label: 'Ground Report',   color: 'bg-amber-50 text-amber-700' },
  'explainer':        { label: 'Explainer',       color: 'bg-teal-50 text-teal-700' },
  'interview':        { label: 'Interview',       color: 'bg-green-50 text-green-700' },
  'photo-essay':      { label: 'Photo Essay',     color: 'bg-orange-50 text-orange-700' },
  'video-report':     { label: 'Video',           color: 'bg-red-50 text-red-700' },
  'book-excerpt':     { label: 'Book Excerpt',    color: 'bg-yellow-50 text-yellow-700' },
  'special-series':   { label: 'Special Series',  color: 'bg-pink-50 text-pink-700' },
  'community-voice':  { label: 'Community Voice', color: 'bg-emerald-50 text-emerald-700' },
  'verified-report':  { label: '✓ Verified',      color: 'bg-green-50 text-green-800' },
  'in-their-words':   { label: 'In Their Words',  color: 'bg-cyan-50 text-cyan-700' },
};

function ContentLabel({ type }: { type?: string }) {
  if (!type) return null;
  const m = CONTENT_TYPE_MAP[type] ?? { label: type, color: 'bg-gray-100 text-ink-muted' };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-[1.5px] px-2 py-0.5 ${m.color}`}>
      {m.label}
    </span>
  );
}

function CategoryLabel({ name, slug }: { name?: string; slug?: string }) {
  if (!name || !slug) return null;
  return (
    <Link
      to={`/category/${slug}`}
      onClick={e => e.stopPropagation()}
      className="text-[9px] font-black uppercase tracking-[2px] text-brand-red hover:text-brand-red-dark transition-colors"
    >
      {name}
    </Link>
  );
}

interface Props {
  article: Article;
  variant?: 'default' | 'compact' | 'horizontal' | 'featured-side' | 'hero' | 'text-only';
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const imageUrl  = article.featuredImage?.url ?? '';
  const imageAlt  = article.featuredImage?.alt ?? article.title;
  const publishDate = article.publishedAt ?? article.createdAt;
  // Safe author name — handles guest authors, missing author, undefined
  const authorName =
    article.isGuestAuthor && article.guestAuthorName
      ? article.guestAuthorName
      : article.author?.name ?? 'The Asr';

  // ── Text-only (sidebar list) ───────────────────────────────────────────────
  if (variant === 'text-only') {
    return (
      <div className="py-4 border-b border-gray-100 last:border-0 group">
        <CategoryLabel name={article.category?.name} slug={article.category?.slug} />
        <Link
          to={`/article/${article.slug}`}
          className="block mt-1.5 font-serif font-semibold text-[14px] leading-snug text-ink group-hover:text-brand-navy transition-colors"
        >
          {article.title}
        </Link>
        <p className="text-[11px] text-ink-muted mt-1.5 font-sans">
          {authorName} · {formatDate(publishDate)}
        </p>
      </div>
    );
  }

  // ── Compact ───────────────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <div className="py-4 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0 group">
        <ContentLabel type={article.contentType} />
        <Link
          to={`/article/${article.slug}`}
          className="block mt-2 text-[13px] font-serif font-semibold text-ink leading-snug group-hover:text-brand-navy transition-colors"
        >
          {article.title}
        </Link>
        <p className="text-[11px] text-ink-muted mt-1.5 font-sans">{formatDate(publishDate)}</p>
      </div>
    );
  }

  // ── Horizontal ────────────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <div className="group flex gap-4 py-5 border-b border-gray-100 last:border-0">
        {imageUrl && (
          <Link to={`/article/${article.slug}`} className="flex-shrink-0">
            <div className="w-20 h-20 overflow-hidden bg-gray-100">
              <img
                src={imageUrl} alt={imageAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <CategoryLabel name={article.category?.name} slug={article.category?.slug} />
            <ContentLabel type={article.contentType} />
          </div>
          <Link
            to={`/article/${article.slug}`}
            className="block font-serif font-bold text-[14px] text-ink line-clamp-2 group-hover:text-brand-navy transition-colors leading-snug"
          >
            {article.title}
          </Link>
          <p className="text-[11px] text-ink-muted mt-2 font-sans">
            {authorName} · {formatDate(publishDate)}
          </p>
        </div>
      </div>
    );
  }

  // ── Featured Side ─────────────────────────────────────────────────────────
  if (variant === 'featured-side') {
    return (
      <div className="group block overflow-hidden bg-white border border-gray-200 hover:shadow-card-hover transition-all duration-300">
        <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
          {imageUrl && (
            <img
              src={imageUrl} alt={imageAlt}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2.5">
              {article.isBreaking && (
                <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5 bg-brand-red text-white">
                  Breaking
                </span>
              )}
              <CategoryLabel name={article.category?.name} slug={article.category?.slug} />
            </div>
            <Link
              to={`/article/${article.slug}`}
              className="block text-xl md:text-2xl font-serif font-bold text-white leading-snug line-clamp-3 hover:text-brand-yellow transition-colors"
            >
              {article.title}
            </Link>
          </div>
        </div>
        <div className="p-5">
          <p className="text-[13px] text-ink-secondary line-clamp-2 leading-relaxed font-sans mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {article.author?.avatar ? (
                <img
                  src={article.author.avatar} alt={authorName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-yellow font-bold text-[10px]">{authorName[0]}</span>
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-ink font-sans">{authorName}</p>
                <p className="text-[10px] text-ink-muted font-sans">{formatDate(publishDate)}</p>
              </div>
            </div>
            {article.readTime > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-ink-muted font-sans">
                <Clock size={11} /> {article.readTime}m
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Hero (full-bleed homepage lead) ───────────────────────────────────────
  if (variant === 'hero') {
    return (
      <div className="group relative overflow-hidden bg-gray-900" style={{ minHeight: '480px' }}>
        {imageUrl && (
          <img
            src={imageUrl} alt={imageAlt}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-1000"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/40 to-transparent" />
        <div className="relative flex flex-col justify-end p-6 md:p-8 h-full" style={{ minHeight: '480px' }}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {article.isBreaking && (
              <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-brand-red text-white">
                Breaking
              </span>
            )}
            {article.category?.name && (
              <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-white/15 text-white backdrop-blur-sm">
                {article.category.name}
              </span>
            )}
            <ContentLabel type={article.contentType} />
          </div>
          <Link
            to={`/article/${article.slug}`}
            className="block text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-white leading-tight mb-3 hover:text-brand-yellow transition-colors"
          >
            {article.title}
          </Link>
          {article.subtitle && (
            <p className="text-white/65 text-base md:text-lg font-sans leading-relaxed mb-4 line-clamp-2 max-w-2xl">
              {article.subtitle}
            </p>
          )}
          <div className="flex items-center gap-4 flex-wrap">
            {article.author?.avatar ? (
              <img
                src={article.author.avatar} alt={authorName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-white/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
                <span className="text-brand-navy font-black text-[11px]">{authorName[0]}</span>
              </div>
            )}
            <span className="text-white/80 text-[12px] font-sans font-medium">{authorName}</span>
            <span className="text-white/45 text-[12px] font-sans">{formatDate(publishDate)}</span>
            {article.readTime > 0 && (
              <span className="text-white/45 text-[12px] font-sans flex items-center gap-1">
                <Clock size={11} /> {article.readTime}m read
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Default card ──────────────────────────────────────────────────────────
  return (
    <div className="group bg-white border border-gray-200 overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col">
      {imageUrl && (
        <Link to={`/article/${article.slug}`} className="block overflow-hidden flex-shrink-0">
          <div className="relative bg-gray-100" style={{ aspectRatio: '16/9' }}>
            <img
              src={imageUrl} alt={imageAlt}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            />
            {article.isBreaking && (
              <span className="absolute top-3 left-3 text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5 bg-brand-red text-white">
                Breaking
              </span>
            )}
            {article.isEditorsPick && (
              <span className="absolute top-3 right-3 text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5 bg-brand-yellow text-brand-navy">
                Editor's Pick
              </span>
            )}
          </div>
        </Link>
      )}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <CategoryLabel name={article.category?.name} slug={article.category?.slug} />
          <ContentLabel type={article.contentType} />
        </div>
        <Link
          to={`/article/${article.slug}`}
          className="block font-serif font-bold text-[15px] text-ink line-clamp-2 group-hover:text-brand-navy transition-colors leading-snug flex-1"
        >
          {article.title}
        </Link>
        {article.excerpt && (
          <p className="text-[12px] text-ink-muted line-clamp-2 mt-2 leading-relaxed font-sans">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-[11px] font-semibold text-ink font-sans">{authorName}</p>
            <p className="text-[10px] text-ink-muted font-sans">{formatDate(publishDate)}</p>
          </div>
          <div className="flex items-center gap-3 text-ink-muted text-[10px] font-sans">
            {article.readTime > 0 && (
              <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}m</span>
            )}
            {(article.views ?? 0) > 0 && (
              <span className="flex items-center gap-1"><Eye size={10} /> {article.views.toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
