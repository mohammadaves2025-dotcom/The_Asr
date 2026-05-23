import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import ContentTypeBadge from '../common/ContentTypeBadge';
import { formatDate, cn } from '../../utils/helpers';
import type { Article } from '../../types';

interface Props {
  article: Article;
  variant?: 'default' | 'compact' | 'horizontal' | 'featured-side';
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group py-4 border-b border-gray-100 last:border-0 hover:text-brand-navy transition-colors"
      >
        <h4 className="text-sm font-serif font-semibold text-ink line-clamp-2 group-hover:text-brand-navy">
          {article.title}
        </h4>
        <p className="text-xs text-ink-muted mt-1">{formatDate(article.publishedAt || article.createdAt)}</p>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group flex gap-4 p-4 bg-white border border-gray-100 hover:shadow-card transition-all duration-300"
      >
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <ContentTypeBadge type={article.type} className="mb-2" />
          <h3 className="font-serif font-bold text-ink line-clamp-2 group-hover:text-brand-navy transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-ink-secondary line-clamp-1 mt-2">{article.excerpt}</p>
          <p className="text-xs text-ink-muted mt-2">{formatDate(article.publishedAt || article.createdAt)}</p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured-side') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group block bg-white border border-gray-100 overflow-hidden hover:shadow-card transition-all duration-300"
      >
        <div className="relative overflow-hidden h-96">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <ContentTypeBadge type={article.type} className="mb-3" />
            <h2 className="text-2xl font-serif font-bold text-white line-clamp-3">{article.title}</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-ink-secondary line-clamp-2 mb-4">{article.excerpt}</p>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {article.author.avatar && (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-yellow"
              />
            )}
            <div>
              <p className="text-sm font-semibold text-ink">{article.author.name}</p>
              <p className="text-xs text-ink-muted">{formatDate(article.publishedAt || article.createdAt)}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group block bg-white border border-gray-100 overflow-hidden hover:shadow-card transition-all duration-300"
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <ContentTypeBadge type={article.type} className="mb-2" />
        <h3 className="text-lg font-serif font-bold text-ink line-clamp-2 group-hover:text-brand-navy transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-ink-secondary line-clamp-2 mt-2">{article.excerpt}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-ink-muted">{formatDate(article.publishedAt || article.createdAt)}</p>
          <div className="flex items-center gap-1 text-ink-muted text-xs">
            <Eye size={14} />
            {article.views}
          </div>
        </div>
      </div>
    </Link>
  );
}
