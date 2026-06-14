import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { formatDate, resolveAuthorName } from '../../utils/helpers';
import type { Article } from '../../types';

// ── Content type label map ─ matches backend CONTENT_TYPES enum exactly ──────
const CONTENT_TYPE_MAP: Record<string, { label: string; color: string }> = {
  'news':             { label: 'News',            color: 'bg-brand-navy text-brand-yellow' },
  'investigation':    { label: 'Investigation',   color: 'bg-brand-navy text-brand-yellow' },
  'opinion':          { label: 'Opinion',         color: 'bg-brand-yellow text-brand-navy' },
  'analysis':         { label: 'Analysis',        color: 'bg-brand-navy text-brand-yellow' },
  'ground-report':    { label: 'Ground Report',   color: 'bg-brand-yellow text-brand-navy' },
  'explainer':        { label: 'Explainer',       color: 'bg-brand-navy text-brand-yellow' },
  'interview':        { label: 'Interview',       color: 'bg-brand-yellow text-brand-navy' },
  'photo-essay':      { label: 'Photo Essay',     color: 'bg-brand-navy text-brand-yellow' },
  'video-report':     { label: 'Video',           color: 'bg-brand-red text-white' },
  'book-excerpt':     { label: 'Book Excerpt',    color: 'bg-brand-yellow text-brand-navy' },
  'special-series':   { label: 'Special Series',  color: 'bg-brand-navy text-brand-yellow' },
  'community-voice':  { label: 'Community Voice', color: 'bg-brand-yellow text-brand-navy' },
  'verified-report':  { label: '✓ Verified',      color: 'bg-brand-navy text-brand-yellow' },
  'in-their-words':   { label: 'In Their Words',  color: 'bg-brand-yellow text-brand-navy' },
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

// ── Verified badge (small inline checkmark) ──────────────────────────────────
function VerifiedBadge() {
  return (
    <span
      title="Verified"
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 flex-shrink-0 ml-0.5"
    >
      <svg viewBox="0 0 24 24" width="8" height="8" fill="white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  );
}

// ── Author name + verified badge ───────────────────────────────────────────────
function AuthorName({
  authorName,
  authorId,
  isGuest,
  authorRole,
  className = '',
  textColor = 'text-ink',
  textColorDark = '',
}: {
  authorName: string;
  authorId?: string;
  isGuest?: boolean;
  authorRole?: string;
  className?: string;
  textColor?: string;
  textColorDark?: string;
}) {
  const shouldShowBadge =
    authorName === 'The Orbis Journal Desk' ||
    (authorRole && authorRole !== 'subscriber');

  if (isGuest || !authorId) {
    return (
      <span className={`inline-flex items-center gap-1 ${className} ${textColor} ${textColorDark}`}>
        <span>{authorName}</span>
        {authorName === 'The Orbis Journal Desk' && <VerifiedBadge />}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Link
        to={`/author/${authorId}`}
        onClick={(e) => e.stopPropagation()}
        className={`hover:text-brand-navy transition-colors ${textColor} ${textColorDark}`}
      >
        {authorName}
      </Link>
      {shouldShowBadge && <VerifiedBadge />}
    </span>
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
  const authorName = article.isGuestAuthor && article.guestAuthorName
    ? article.guestAuthorName
    : resolveAuthorName(article.author?.name);
  const authorId = article.author?._id;
  const authorRole = article.author?.role;
  const isGuest = article.isGuestAuthor;

  // ── Text-only (sidebar list) ───────────────────────────────────────────────
  if (variant === 'text-only') {
    return (
      <div className="py-3.5 border-b border-gray-100 last:border-0 group">
        <CategoryLabel name={article.category?.name} slug={article.category?.slug} />
        <div className="flex gap-3 items-start mt-1.5">
          {/* Thumbnail — LEFT, aligned with title */}
          <Link to={`/article/${article.slug}`} className="flex-shrink-0">
            {article.featuredImage?.url ? (
              <div className="w-24 aspect-video rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="w-24 aspect-video rounded-lg bg-gradient-to-br from-brand-navy to-brand-navy-dark flex items-center justify-center">
                <span className="text-brand-yellow font-serif font-black text-xl">
                  {article.title?.[0] ?? '?'}
                </span>
              </div>
            )}
          </Link>
          {/* Title + byline — RIGHT */}
          <div className="flex-1 min-w-0">
            <Link
              to={`/article/${article.slug}`}
              className="block font-serif font-semibold text-[15px] leading-snug text-ink group-hover:text-brand-navy transition-colors line-clamp-3"
            >
              {article.title}
            </Link>
            <p className="text-[11px] text-ink-muted mt-1.5 font-sans">
              <AuthorName
                authorName={authorName}
                authorId={authorId}
                isGuest={isGuest}
                authorRole={authorRole}
              /> · {formatDate(publishDate)}
            </p>
          </div>
        </div>
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
          className="block mt-2 text-[15px] font-serif font-semibold text-ink leading-snug group-hover:text-brand-navy transition-colors"
        >
          {article.title}
        </Link>
        <p className="text-[12px] text-ink-muted mt-1.5 font-sans flex items-center gap-2">
          <AuthorName
            authorName={authorName}
            authorId={authorId}
            isGuest={isGuest}
            authorRole={authorRole}
          />
          <span className="text-ink-muted/40">·</span>
          {formatDate(publishDate)}
          {(article.readTime ?? 0) > 0 && (
            <>
              <span className="text-ink-muted/40">·</span>
              <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}m</span>
            </>
          )}
        </p>
      </div>
    );
  }

  // ── Horizontal ────────────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <div className="group flex gap-4 py-5 border-b border-gray-100 last:border-0">
        {imageUrl && (
          <Link to={`/article/${article.slug}`} className="flex-shrink-0">
            <div className="w-20 h-20 overflow-hidden bg-gray-100 rounded-lg">
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
            className="block font-serif font-bold text-[16px] text-ink line-clamp-2 group-hover:text-brand-navy transition-colors leading-snug"
          >
            {article.title}
          </Link>
          <p className="text-[12px] text-ink-muted mt-2 font-sans flex items-center gap-1">
            <AuthorName
              authorName={authorName}
              authorId={authorId}
              isGuest={isGuest}
              authorRole={authorRole}
            /> · {formatDate(publishDate)}
          </p>
        </div>
      </div>
    );
  }

  // ── Featured Side ─────────────────────────────────────────────────────────
  if (variant === 'featured-side') {
    return (
      <div className="group block overflow-hidden bg-white border border-gray-200 rounded-xl hover:shadow-card-hover transition-all duration-300">
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
              className="block text-2xl md:text-3xl font-serif font-bold text-white leading-snug line-clamp-3 hover:text-brand-yellow transition-colors"
            >
              {article.title}
            </Link>
          </div>
        </div>
        <div className="p-5">
          <p className="text-[14px] text-ink-secondary line-clamp-2 leading-relaxed font-sans mb-4">
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
                <p className="text-[12px] font-semibold text-ink font-sans flex items-center gap-1">
                  <AuthorName
                    authorName={authorName}
                    authorId={authorId}
                    isGuest={isGuest}
                    authorRole={authorRole}
                  />
                </p>
                <p className="text-[11px] text-ink-muted font-sans">{formatDate(publishDate)}</p>
              </div>
            </div>
            {(article.readTime ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-ink-muted font-sans">
                <Clock size={11} /> {article.readTime}m
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Hero (full-bleed homepage lead) ─────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <div className="group relative overflow-hidden rounded-xl bg-gray-900" style={{ minHeight: '480px' }}>
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
            <span className="text-white/80 text-[12px] font-sans font-medium flex items-center gap-1">
              <AuthorName
                authorName={authorName}
                authorId={authorId}
                isGuest={isGuest}
                authorRole={authorRole}
                textColor="text-white/80"
                textColorDark="hover:text-brand-yellow"
              />
            </span>
            <span className="text-white/45 text-[12px] font-sans">{formatDate(publishDate)}</span>
            {(article.readTime ?? 0) > 0 && (
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
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-card-hover transition-all duration-300 flex flex-col">
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
          className="block font-serif font-bold text-[17px] text-ink line-clamp-2 group-hover:text-brand-navy transition-colors leading-snug flex-1"
        >
          {article.title}
        </Link>
        {article.excerpt && (
          <p className="text-[13px] text-ink-muted line-clamp-2 mt-2 leading-relaxed font-sans">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-[12px] font-semibold text-ink font-sans flex items-center gap-1">
              <AuthorName
                authorName={authorName}
                authorId={authorId}
                isGuest={isGuest}
                authorRole={authorRole}
              />
            </p>
            <p className="text-[11px] text-ink-muted font-sans">{formatDate(publishDate)}</p>
          </div>
          <div className="flex items-center gap-3 text-ink-muted text-[10px] font-sans">
            {(article.readTime ?? 0) > 0 && (
              <span className="flex items-center gap-1"><Clock size={10} /> {article.readTime}m</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}