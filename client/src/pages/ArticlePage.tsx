import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Share2, Clock, Eye, Calendar } from 'lucide-react';
import ContentTypeBadge from '../components/common/ContentTypeBadge';
import { articlesService } from '../services/articles';
import { formatDateLong, formatRelative } from '../utils/helpers';
import type { Article } from '../types';

function ShareBar({ article }: { article: Article }) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.title);
  return (
    <div className="flex flex-wrap items-center gap-3 py-5 border-y border-gray-200 my-8">
      <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Share</span>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs font-bold hover:bg-brand-navy hover:text-brand-yellow hover:border-brand-navy transition-all">
        Twitter / X
      </a>
      <a href={`https://api.whatsapp.com/send?text=${text}%20${url}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
        WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
        Facebook
      </a>
      <button onClick={() => { navigator.clipboard.writeText(window.location.href); }}
        className="ml-auto flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-xs font-bold hover:bg-gray-100 transition-all">
        <Share2 size={12} /> Copy Link
      </button>
    </div>
  );
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => (slug ? articlesService.getBySlug(slug) : Promise.reject('No slug')),
    enabled: !!slug,
  });

  // Increment views
  useEffect(() => {
    if (slug) {
      articlesService.incrementViews(slug).catch(() => {});
    }
  }, [slug]);

  const article = data?.data?.data?.article;

  if (isLoading) {
    return (
      <div className="container-site py-20">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
          <div className="h-72 bg-gray-200 rounded mt-6" />
          <div className="space-y-3 mt-8">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${100 - i * 5}%` }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-site py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-ink mb-3">Article not found</h2>
        <p className="text-ink-muted mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  // Corrections banner
  const hasCorrections = article.corrections && article.corrections.length > 0;

  return (
    <article className="bg-white">
      <div className="container-site py-10 md:py-14">
        <div className="max-w-3xl mx-auto">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-ink-muted mb-6 font-sans">
            <Link to="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>›</span>
            {article.category && (
              <>
                <Link to={`/category/${article.category.slug}`} className="hover:text-brand-navy transition-colors capitalize">
                  {article.category.name}
                </Link>
                <span>›</span>
              </>
            )}
            <span className="text-ink truncate">{article.title.substring(0, 50)}…</span>
          </nav>

          {/* Content Type Badge + Flags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <ContentTypeBadge type={article.contentType} />
            {article.isBreaking && (
              <span className="text-[10px] font-black tracking-[2px] uppercase px-2 py-1 bg-accent-red text-white animate-pulse">
                Breaking
              </span>
            )}
            {article.isVerified && (
              <span className="text-[10px] font-black tracking-[2px] uppercase px-2 py-1 bg-green-100 text-green-800 border border-green-200">
                ✓ Verified Report
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-ink leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subtitle */}
          {article.subtitle && (
            <p className="text-xl font-serif text-ink-muted italic mb-6 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-6 border-b border-gray-200 text-sm">
            <div className="flex items-center gap-2.5">
              {article.author?.avatar ? (
                <img src={article.author.avatar} alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-yellow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center">
                  <span className="text-brand-yellow font-bold text-sm">{article.author?.name?.[0] ?? 'A'}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-ink">{article.author?.name ?? 'The Asr'}</p>
                {article.author?.designation && (
                  <p className="text-xs text-ink-muted">{article.author.designation}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-ink-muted">
              <Calendar size={13} />
              <span>{formatDateLong(article.publishedAt ?? article.createdAt)}</span>
            </div>
            {article.readTime > 0 && (
              <div className="flex items-center gap-1 text-ink-muted">
                <Clock size={13} />
                <span>{article.readTime} min read</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-ink-muted">
              <Eye size={13} />
              <span>{(article.views ?? 0).toLocaleString()} views</span>
            </div>
            {article.location?.state && (
              <span className="text-ink-muted">📍 {article.location.state}</span>
            )}
          </div>

          {/* Featured Image */}
          {article.featuredImage?.url && (
            <figure className="my-8 -mx-4 sm:mx-0">
              <img
                src={article.featuredImage.url}
                alt={article.featuredImage.alt ?? article.title}
                className="w-full max-h-[520px] object-cover"
              />
              {(article.featuredImage.caption || article.featuredImage.credit) && (
                <figcaption className="flex justify-between text-xs text-ink-muted pt-2 px-4 sm:px-0">
                  <span>{article.featuredImage.caption}</span>
                  {article.featuredImage.credit && <span>📷 {article.featuredImage.credit}</span>}
                </figcaption>
              )}
            </figure>
          )}

          {/* Excerpt lede */}
          {article.excerpt && (
            <p className="text-xl font-serif italic text-ink-muted leading-relaxed mb-8 pb-8 border-b border-gray-100">
              {article.excerpt}
            </p>
          )}

          {/* Corrections banner */}
          {hasCorrections && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200">
              <p className="text-xs font-bold uppercase tracking-widest text-yellow-800 mb-1">Correction</p>
              {article.corrections.map((c: any, i: number) => (
                <p key={i} className="text-sm text-yellow-900">{c.note}</p>
              ))}
            </div>
          )}

          {/* Body */}
          <div
            className="prose prose-lg prose-headings:font-serif prose-a:text-accent-red prose-blockquote:font-serif prose-blockquote:text-xl max-w-none text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.body ?? '<p>Content coming soon.</p>' }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-gray-200">
              <span className="text-xs font-bold uppercase tracking-widest text-ink-muted mr-2">Topics:</span>
              {article.tags.map((tag: string) => (
                <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 border border-gray-200 text-xs font-medium text-ink-muted hover:border-brand-navy hover:text-brand-navy transition-all">
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <ShareBar article={article} />

          {/* Author Card */}
          {article.author && (
            <div className="flex items-start gap-4 p-6 bg-surface-secondary border border-gray-100 mt-8">
              {article.author.avatar ? (
                <img src={article.author.avatar} alt={article.author.name}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-yellow text-xl font-bold">{article.author.name[0]}</span>
                </div>
              )}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted mb-1">About the Author</p>
                <p className="font-serif font-bold text-lg text-ink">{article.author.name}</p>
                {article.author.bio && (
                  <p className="text-sm text-ink-muted mt-1.5 leading-relaxed">{article.author.bio}</p>
                )}
              </div>
            </div>
          )}

          {/* Support CTA */}
          <div className="mt-10 p-8 bg-brand-navy text-white text-center">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-3">Support Independent Journalism</p>
            <h3 className="font-serif font-bold text-2xl mb-3">
              Stories like this need readers like you.
            </h3>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              The Asr is entirely reader-funded. No ads, no corporate masters.
            </p>
            <Link to="/support" className="inline-flex items-center gap-2 bg-brand-yellow text-brand-navy px-8 py-3 font-bold text-sm uppercase tracking-widest hover:bg-brand-yellow-dark transition-colors">
              Support Our Journalism
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
