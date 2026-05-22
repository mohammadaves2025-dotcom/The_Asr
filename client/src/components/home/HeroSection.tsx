import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import CategoryBadge from '../common/CategoryBadge';
import ContentTypeBadge from '../common/ContentTypeBadge';
import { formatDate, formatReadTime } from '../../utils/helpers';
import type { Article } from '../../types';

interface Props {
  hero: Article;
  featured: Article[];
}

export default function HeroSection({ hero, featured }: Props) {
  return (
    <section className="border-b border-gray-200">
      <div className="container-site">
        <div className="grid lg:grid-cols-3 gap-0 lg:gap-8 py-8">
          {/* Main hero */}
          <div className="lg:col-span-2 group">
            {hero.featuredImage?.url ? (
              <Link to={`/article/${hero.slug}`} className="block overflow-hidden mb-5 bg-gray-100">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={hero.featuredImage.url}
                    alt={hero.featuredImage.alt || hero.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    loading="eager"
                  />
                </div>
              </Link>
            ) : (
              <div className="aspect-video bg-brand-navy mb-5 flex items-end p-8">
                <div />
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <CategoryBadge category={hero.category} />
              <ContentTypeBadge type={hero.contentType} />
              {hero.isVerified && (
                <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-2 py-0.5 bg-accent-emerald text-white">
                  Verified
                </span>
              )}
            </div>

            <Link to={`/article/${hero.slug}`} className="no-underline block">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-ink leading-tight line-clamp-3 group-hover:text-brand-navy transition-colors text-balance">
                {hero.title}
              </h1>
            </Link>

            {hero.subtitle && (
              <p className="text-lg text-ink-secondary font-sans mt-3 leading-relaxed line-clamp-2">
                {hero.subtitle}
              </p>
            )}

            <p className="text-base text-ink-secondary mt-3 leading-relaxed line-clamp-3">
              {hero.excerpt}
            </p>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                {hero.author.avatar && (
                  <img src={hero.author.avatar} alt={hero.author.name} className="w-9 h-9 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold text-ink">{hero.author.name}</p>
                  {hero.author.designation && (
                    <p className="text-xs text-ink-muted">{hero.author.designation}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-ink-muted">
                <span>{formatDate(hero.publishedAt || hero.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {formatReadTime(hero.readTime)}
                </span>
                <Link
                  to={`/article/${hero.slug}`}
                  className="btn-primary py-2 px-4 text-[11px] no-underline"
                >
                  Read <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured sidebar */}
          <div className="mt-8 lg:mt-0 border-t lg:border-t-0 lg:border-l border-gray-200 pt-8 lg:pt-0 lg:pl-8">
            <h2 className="section-heading">Editor's Picks</h2>
            <div className="flex flex-col gap-5">
              {featured.slice(0, 4).map((article, i) => (
                <div key={article._id} className="group flex gap-3">
                  <span className="flex-shrink-0 text-2xl font-serif font-bold text-gray-200 leading-none w-8">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <CategoryBadge category={article.category} size="xs" />
                    <Link to={`/article/${article.slug}`} className="no-underline block mt-1.5">
                      <h3 className="text-base font-serif font-semibold text-ink leading-snug line-clamp-3 group-hover:text-brand-navy transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-ink-muted">
                      <span>{article.author.name}</span>
                      <span>·</span>
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
