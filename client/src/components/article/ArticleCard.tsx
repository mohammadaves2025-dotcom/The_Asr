import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
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
          'group flex gap-3 items-start py-3 border-b border-gray-100 last:border-0 hover:no-underline',
          className
        )}
      >
        {showImage && article.featuredImage?.url && (
          <div className="flex-shrink-0 w-20 h-16 overflow-hidden bg-gray-100">
            <img
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-serif font-semibold text-ink leading-snug line-clamp-2 group-hover:text-brand-navy transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-ink-muted mt-1">{formatDate(article.publishedAt || article.createdAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={cn('group flex gap-4 items-start', className)}>
        {showImage && article.featuredImage?.url && (
          <Link to={`/article/${article.slug}`} className="flex-shrink-0 w-32 sm:w-40 overflow-hidden bg-gray-100">
            <div className="aspect-video overflow-hidden">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <CategoryBadge category={article.category} size="xs" />
          <Link to={`/article/${article.slug}`} className="no-underline block mt-1.5">
            <h3 className="text-base font-serif font-semibold text-ink leading-snug line-clamp-3 group-hover:text-brand-navy transition-colors">
              {article.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 mt-2 text-xs text-ink-muted">
            <span>{article.author.name}</span>
            <span>·</span>
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
          <Link to={`/article/${article.slug}`} className="block overflow-hidden mb-3 bg-gray-100">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.alt || article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
          </Link>
        )}
        <CategoryBadge category={article.category} size="xs" />
        <Link to={`/article/${article.slug}`} className="no-underline block mt-2">
          <h3 className="text-lg font-serif font-bold text-ink leading-snug line-clamp-3 group-hover:text-brand-navy transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-ink-secondary line-clamp-2 mt-2">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-ink-muted">
          <span>{article.author.name}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt || article.createdAt)}</span>
        </div>
      </div>
    );
  }

  // Default card
  return (
    <div className={cn('group flex flex-col', className)}>
      {showImage && article.featuredImage?.url && (
        <Link to={`/article/${article.slug}`} className="overflow-hidden block bg-gray-100">
          <div className="aspect-video overflow-hidden">
            <img
              src={article.featuredImage.url}
              alt={article.featuredImage.alt || article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </Link>
      )}
      <div className="flex flex-col flex-1 pt-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategoryBadge category={article.category} size="xs" />
          {article.contentType !== 'news' && <ContentTypeBadge type={article.contentType} />}
        </div>
        <Link to={`/article/${article.slug}`} className="no-underline block mt-2">
          <h3 className="text-xl font-serif font-bold text-ink leading-snug line-clamp-3 group-hover:text-brand-navy transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-ink-secondary line-clamp-2 mt-2 leading-relaxed">{article.excerpt}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-ink-muted border-t border-gray-100 pt-3">
          <span className="font-medium">{article.author.name}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={11} /> {formatReadTime(article.readTime)}
          </span>
          {article.views > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Eye size={11} /> {article.views.toLocaleString()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
