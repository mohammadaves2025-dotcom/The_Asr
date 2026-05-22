import { Link } from 'react-router-dom';
import { Clock, Eye, Sparkles } from 'lucide-react';
import CategoryBadge from '../common/CategoryBadge';
import ContentTypeBadge from '../common/ContentTypeBadge';
import { formatDate, formatReadTime, cn } from '../../utils/helpers';
import type { Article } from '../../types';

interface Props {
  article: Article;
  variant?: 'default' | 'horizontal' | 'compact' | 'featured-side';
  showImage?: boolean;
  className?: string;
}

export default function ArticleCard({ article, variant = 'default', showImage = true, className }: Props) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className={cn(
          'group flex gap-3 items-start py-4 px-3 border-b border-gray-100 last:border-0 hover:bg-surface-secondary rounded transition-all duration-300 no-underline',
          className
        )}
      >
        {showImage && article.featuredImage?.url && (
          <div className="flex-shrink-0 w-20 h-16 overflow-hidden bg-gray-100 rounded-lg group-hover:shadow-md transition-all duration-300">
            <img
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-serif font-semibold text-ink leading-snug line-clamp-2 group-hover:text-brand-navy transition-colors duration-300">
            {article.title}
          </h3>
          <p className="text-xs text-ink-muted mt-1.5 font-medium">{formatDate(article.publishedAt || article.createdAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('group flex gap-5 items-start p-4 rounded-xl hover:bg-surface-secondary transition-all duration-300', className)}>
        {showImage && article.featuredImage?.url && (
          <Link to={`/article/${article.slug}`} className="flex-shrink-0 w-32 sm:w-40 overflow-hidden bg-gray-100 rounded-xl group-hover:shadow-md transition-all duration-300">
            <div className="aspect-video overflow-hidden">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge category={article.category} size="xs" />
          <Link to={`/article/${article.slug}`} className="no-underline block mt-2 group/title">
            <h3 className="text-base font-serif font-bold text-ink leading-snug line-clamp-3 group-hover/title:text-brand-navy transition-colors duration-300">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-3 text-xs text-ink-muted">
            <span className="font-medium">{article.author.name}</span>
            <span className="text-ink-faint">·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {formatReadTime(article.readTime)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured-side') {
    return (
      <div className={cn('group', className)}>
        {showImage && article.featuredImage?.url && (
          <Link to={`/article/${article.slug}`} className="block overflow-hidden mb-4 bg-gray-100 rounded-xl group-hover:shadow-lg transition-all duration-300">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {article.isEditorsPick && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-brand-yellow text-brand-navy px-2.5 py-1.5 rounded-full text-xs font-bold font-sans uppercase tracking-widest">
                  <Sparkles size={12} fill="currentColor" /> Pick
                </div>
              )}
            </div>
          </Link>
        )}
        <CategoryBadge category={article.category} size="xs" />
        <Link to={`/article/${article.slug}`} className="no-underline block mt-2.5 group/title">
          <h3 className="text-lg font-serif font-bold text-ink leading-snug line-clamp-3 group-hover/title:text-brand-navy transition-colors duration-300">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-ink-secondary line-clamp-2 mt-2.5 leading-relaxed font-light">{article.excerpt}</p>
        <div className="flex items-center gap-2.5 mt-3.5 text-xs text-ink-muted">
          <span className="font-medium">{article.author.name}</span>
          <span className="text-ink-faint">·</span>
          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
        </div>
      </div>
    );
  }

  // Default card — premium grid design
  return (
    <Link
      to={`/article/${article.slug}`}
      className={cn('group flex flex-col h-full no-underline rounded-xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-lg hover:-translate-y-1', className)}
    >
      {showImage && article.featuredImage?.url && (
        <div className="overflow-hidden bg-gray-100 relative aspect-video">
          <img
            src={article.featuredImage.url}
            alt={article.featuredImage.alt || article.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex items-center gap-2.5 flex-wrap mb-3">
          <CategoryBadge category={article.category} size="xs" />
          {article.contentType !== 'news' && <ContentTypeBadge type={article.contentType} />}
          {article.isMustRead && (
            <span className="text-[9px] font-bold font-sans uppercase tracking-widest px-2 py-1 bg-accent-red/10 text-accent-red rounded-full">
              Must Read
            </span>
          )}
        </div>

        <h3 className="text-xl font-serif font-bold text-ink leading-tight line-clamp-3 group-hover:text-brand-navy transition-colors duration-300 mb-3">
          {article.title}
        </h3>

        <p className="text-sm text-ink-secondary line-clamp-2 leading-relaxed flex-1 font-light mb-4">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {article.author.avatar ? (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold">
                {article.author.name[0]}
              </div>
            )}
            <span className="text-xs font-semibold text-ink hidden sm:inline">{article.author.name}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1">
              <Clock size={12} className="transition-colors duration-300 group-hover:text-brand-navy" />
              <span className="hidden sm:inline">{formatReadTime(article.readTime)}</span>
            </span>
            {article.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye size={12} className="transition-colors duration-300 group-hover:text-brand-navy" />
                <span className="hidden sm:inline">{(article.views / 1000).toFixed(0)}k</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
