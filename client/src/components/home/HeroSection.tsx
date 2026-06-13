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
    <section className="bg-white">
      <div className="container-site py-10 lg:py-14">
        <div className="grid lg:grid-cols-3 gap-0 lg:gap-10">

          {/* ── Main hero — full image with dark overlay + text on top ── */}
          <div className="lg:col-span-2 animate-fade-in">
            <Link
              to={`/article/${hero.slug}`}
              className="group block relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500"
              style={{ minHeight: '480px' }}
            >
              {/* Image */}
              {hero.featuredImage?.url ? (
                <img
                  src={hero.featuredImage.url}
                  alt={hero.featuredImage.alt || hero.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-navy to-brand-navy-dark" />
              )}

              {/* Strong gradient overlay for readable text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/10" />

              {/* Breaking badge top-right */}
              {hero.isBreaking && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-brand-red text-white px-4 py-2 rounded-full animate-pulse z-10">
                  <Flame size={13} fill="currentColor" />
                  <span className="text-[10px] font-black font-sans uppercase tracking-widest">Breaking</span>
                </div>
              )}

              {/* Text content pinned to bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10 z-10">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {hero.category?.name && (
                    <span className="text-[10px] font-black uppercase tracking-[2px] px-3 py-1 bg-brand-yellow text-brand-navy rounded-full">
                      {hero.category.name}
                    </span>
                  )}
                  <ContentTypeBadge type={hero.contentType} />
                  {hero.isVerified && (
                    <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1 bg-white/20 text-white backdrop-blur-sm rounded-full flex items-center gap-1">
                      <CheckCircle size={11} /> Verified
                    </span>
                  )}
                  {hero.isEditorsPick && (
                    <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-3 py-1 bg-white/20 text-white backdrop-blur-sm rounded-full">
                      Features
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-serif font-black text-white leading-tight mb-3 drop-shadow-lg">
                  {hero.title}
                </h1>

                {/* Subtitle */}
                {(hero.subtitle || hero.excerpt) && (
                  <p className="text-white/80 text-base md:text-lg font-sans leading-relaxed line-clamp-2 mb-5 font-light max-w-2xl">
                    {hero.subtitle || hero.excerpt}
                  </p>
                )}

                {/* Author + meta + CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {hero.author?.avatar ? (
                      <img src={hero.author.avatar} alt={hero.author.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-yellow" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center font-bold text-brand-navy text-sm ring-2 ring-white/30">
                        {hero.author?.name?.[0] ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-[13px] font-semibold font-sans leading-none">{hero.author?.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-white/55 text-[11px] font-sans">
                        <span>{formatDate(hero.publishedAt || hero.createdAt)}</span>
                        <span>·</span>
                        <Clock size={10} className="inline" />
                        <span>{formatReadTime(hero.readTime ?? 0)}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-2 bg-brand-yellow text-brand-navy font-black text-[11px] uppercase tracking-[2px] px-5 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors">
                    Read Full <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* ── Featured sidebar — with images ── */}
          <div className="lg:border-l-2 border-gray-100 pt-8 lg:pt-0 lg:pl-10 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-red mb-6 font-sans">
              Editor's Picks
            </p>
            <div className="space-y-5">
              {featured.slice(0, 4).map((article, i) => (
                <div key={article._id} className="group flex gap-3 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                  {/* Thumbnail */}
                  <Link to={`/article/${article.slug}`}>
                    {article.featuredImage?.url ? (
                      <div className="w-[142px] h-[80px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={article.featuredImage.url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-[142px] h-[80px] rounded-lg bg-gradient-to-br from-brand-navy to-brand-navy-dark flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-serif font-black text-brand-yellow">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <CategoryBadge category={article.category!} size="xs" />
                    <Link to={`/article/${article.slug}`} className="no-underline block mt-1.5 group/pick">
                      <h3 className="text-[15px] font-serif font-bold text-ink leading-snug line-clamp-3 group-hover/pick:text-brand-navy transition-colors duration-200">
                        {article.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-ink-muted font-sans">
                      <span className="font-medium">{article.author?.name}</span>
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