import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Flame, CircleCheck as CheckCircle } from 'lucide-react';
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
    <section className="border-b-2 border-gray-100 bg-gradient-to-b from-surface to-surface-secondary">
      <div className="container-site py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main hero */}
          <div className="lg:col-span-2 group animate-fade-in">
            {hero.featuredImage?.url ? (
              <Link to={`/article/${hero.slug}`} className="block overflow-hidden mb-8 bg-gray-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700">
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={hero.featuredImage.url}
                    alt={hero.featuredImage.alt || hero.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="eager"
                  />
                  {hero.isBreaking && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-accent-red text-white px-4 py-2 rounded-full animate-pulse">
                      <Flame size={14} fill="currentColor" />
                      <span className="text-xs font-bold font-sans uppercase tracking-widest">Breaking</span>
                    </div>
                  )}
                </div>
              </Link>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-brand-navy to-brand-navy-dark mb-8 flex items-end p-8 rounded-2xl">
                <div />
              </div>
            )}

            <div className="flex items-center gap-2.5 mb-5 flex-wrap">
              <CategoryBadge category={hero.category} />
              <ContentTypeBadge type={hero.contentType} />
              {hero.isVerified && (
                <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 bg-accent-emerald/10 text-accent-emerald rounded-full flex items-center gap-1">
                  <CheckCircle size={11} /> Verified
                </span>
              )}
              {hero.isEditorsPick && (
                <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1.5 bg-brand-yellow/20 text-brand-navy rounded-full">
                  Editor's Pick
                </span>
              )}
            </div>

            <Link to={`/article/${hero.slug}`} className="no-underline block group/title">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-ink leading-tight text-balance mb-4 transition-all duration-500 group-hover/title:text-brand-navy">
                {hero.title}
              </h1>
            </Link>

            {hero.subtitle && (
              <p className="text-xl text-ink-secondary font-sans font-medium mt-4 leading-relaxed line-clamp-2 mb-4">
                {hero.subtitle}
              </p>
            )}

            <p className="text-lg text-ink-secondary leading-relaxed line-clamp-4 mb-6 font-light">
              {hero.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center gap-4">
                {hero.author.avatar ? (
                  <img src={hero.author.avatar} alt={hero.author.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-yellow shadow-md" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white flex items-center justify-center font-bold text-sm ring-2 ring-brand-yellow">
                    {hero.author.name[0]}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-ink">{hero.author.name}</p>
                  {hero.author.designation && (
                    <p className="text-xs text-ink-muted font-medium">{hero.author.designation}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                <div className="badge-minimal">
                  <span>{formatDate(hero.publishedAt || hero.createdAt)}</span>
                </div>
                <div className="badge-minimal">
                  <Clock size={13} />
                  <span>{formatReadTime(hero.readTime)}</span>
                </div>
                <Link
                  to={`/article/${hero.slug}`}
                  className="btn-primary py-3 px-6 text-xs no-underline"
                >
                  Read Full <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Featured sidebar */}
          <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-gray-200 pt-8 lg:pt-0 lg:pl-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-heading mb-8">Editor's Picks</h2>
            <div className="space-y-6">
              {featured.slice(0, 4).map((article, i) => (
                <div key={article._id} className="group flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-yellow to-brand-yellow-dark flex items-center justify-center">
                      <span className="text-lg font-serif font-bold text-brand-navy leading-none">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CategoryBadge category={article.category} size="xs" />
                    <Link to={`/article/${article.slug}`} className="no-underline block mt-1.5 group/pick">
                      <h3 className="text-base font-serif font-semibold text-ink leading-snug line-clamp-3 group-hover/pick:text-brand-navy transition-colors duration-300">
                        {article.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2.5 text-xs text-ink-muted">
                      <span className="font-medium">{article.author.name}</span>
                      <span className="text-ink-faint">·</span>
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
