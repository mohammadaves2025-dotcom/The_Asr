import { Link } from 'react-router-dom';
import { Eye, Clock } from 'lucide-react';
import ContentTypeBadge from '../common/ContentTypeBadge';
import { formatDate } from '../../utils/helpers';
import type { Article } from '../../types';

interface Props {
  article: Article;
  variant?: 'default' | 'compact' | 'horizontal' | 'featured-side';
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const imageUrl = article.featuredImage?.url ?? '';
  const imageAlt = article.featuredImage?.alt ?? article.title;
  const publishDate = article.publishedAt ?? article.createdAt;

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`}
        className="group py-4 border-b border-gray-100 last:border-0 block hover:text-brand-navy transition-colors">
        <ContentTypeBadge type={article.contentType} className="mb-1.5" />
        <h4 className="text-sm font-serif font-semibold text-ink line-clamp-2 group-hover:text-brand-navy">
          {article.title}
        </h4>
        <p className="text-xs text-ink-muted mt-1">{formatDate(publishDate)}</p>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.slug}`}
        className="group flex gap-4 p-4 bg-white border border-gray-100 hover:shadow-card transition-all duration-300">
        {imageUrl && (
          <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-gray-100">
            <img src={imageUrl} alt={imageAlt}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <ContentTypeBadge type={article.contentType} className="mb-1.5" />
          <h3 className="font-serif font-bold text-ink line-clamp-2 group-hover:text-brand-navy transition-colors text-sm">
            {article.title}
          </h3>
          <p className="text-xs text-ink-secondary line-clamp-1 mt-1.5">{article.excerpt}</p>
          <p className="text-xs text-ink-muted mt-1.5">{formatDate(publishDate)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured-side') {
    return (
      <Link to={`/article/${article.slug}`}
        className="group block bg-white border border-gray-100 overflow-hidden hover:shadow-card transition-all duration-300">
        <div className="relative overflow-hidden h-72 md:h-96 bg-gray-100">
          {imageUrl && (
            <img src={imageUrl} alt={imageAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-3">
              {article.isBreaking && (
                <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5 bg-accent-red text-white">Breaking</span>
              )}
              <ContentTypeBadge type={article.contentType} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white line-clamp-3 leading-snug">{article.title}</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-ink-secondary line-clamp-2 mb-4 leading-relaxed">{article.excerpt}</p>
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
            {article.author?.avatar ? (
              <img src={article.author.avatar} alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-yellow flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                <span className="text-brand-yellow font-bold text-sm">{article.author?.name?.[0] ?? 'A'}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{article.author?.name}</p>
              <p className="text-xs text-ink-muted">{formatDate(publishDate)}</p>
            </div>
            {article.readTime > 0 && (
              <div className="flex items-center gap-1 text-ink-muted text-xs ml-auto">
                <Clock size={12} />
                <span>{article.readTime}m</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // default card
  return (
    <Link to={`/article/${article.slug}`}
      className="group block bg-white border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all duration-300">
      <div className="relative overflow-hidden h-48 bg-gray-100">
        {imageUrl && (
          <img src={imageUrl} alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        {article.isBreaking && (
          <span className="absolute top-3 left-3 text-[9px] font-black tracking-[2px] uppercase px-2 py-0.5 bg-accent-red text-white">Breaking</span>
        )}
      </div>
      <div className="p-4">
        <ContentTypeBadge type={article.contentType} className="mb-2" />
        <h3 className="text-base font-serif font-bold text-ink line-clamp-2 group-hover:text-brand-navy transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="text-sm text-ink-secondary line-clamp-2 mt-2 leading-relaxed">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs font-medium text-ink">{article.author?.name}</p>
            <p className="text-xs text-ink-muted">{formatDate(publishDate)}</p>
          </div>
          <div className="flex items-center gap-3 text-ink-muted text-xs">
            {article.readTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock size={11} />
                {article.readTime}m
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye size={11} />
              {(article.views ?? 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
