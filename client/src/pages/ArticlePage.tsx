import { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, Calendar, Link2, ArrowLeft, Bookmark, AlertTriangle } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService } from '../services/articles';
import { formatDateLong } from '../utils/helpers';
import type { Article } from '../types';

function ReadingProgress() {
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = progressRef.current;
      if (!el) return;
      const docEl = document.documentElement;
      const totalHeight = docEl.scrollHeight - docEl.clientHeight;
      const pct = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      el.style.width = `${Math.min(pct, 100)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div ref={progressRef} id="reading-progress" style={{ width: '0%' }} />;
}

function ShareBar({ article }: { article: Article }) {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.title);
  const copyLink = () => { navigator.clipboard.writeText(window.location.href); };
  return (
    <div className="flex flex-wrap items-center gap-2 py-5 border-y border-gray-200 my-8">
      <span className="text-[10px] font-black uppercase tracking-[2px] text-ink-muted mr-1 font-sans">Share</span>
      <a href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-ink hover:text-white hover:border-ink transition-all font-sans">
         Twitter / X
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-sans">
         Facebook
      </a>
      <a href={`https://api.whatsapp.com/send?text=${text}%20${url}`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition-all font-sans">
        WhatsApp
      </a>
      <button onClick={copyLink}
        className="ml-auto flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-gray-100 transition-all font-sans">
        <Link2 size={11} /> Copy Link
      </button>
    </div>
  );
}

function AuthorCard({ article }: { article: Article }) {
  const authorName = article.isGuestAuthor && article.guestAuthorName ? article.guestAuthorName : article.author?.name;
  const authorBio = article.isGuestAuthor ? article.guestAuthorBio : article.author?.bio;
  return (
    <div className="border-t-2 border-ink pt-8 mt-10">
      <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-5 font-sans">About the Author</p>
      <div className="flex items-start gap-4">
        {article.author?.avatar ? (
          <img src={article.author.avatar} alt={authorName}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
            <span className="text-brand-yellow font-black text-lg">{authorName?.[0] ?? 'A'}</span>
          </div>
        )}
        <div className="flex-1">
          {!article.isGuestAuthor ? (
            <Link to={`/author/${article.author?._id}`}
              className="font-serif font-bold text-lg text-ink hover:text-brand-navy transition-colors">
              {authorName}
            </Link>
          ) : (
            <p className="font-serif font-bold text-lg text-ink">{authorName}</p>
          )}
          {article.author?.designation && (
            <p className="text-[11px] text-ink-muted font-sans mt-0.5">{article.author.designation}</p>
          )}
          {authorBio && (
            <p className="text-[13px] text-ink-secondary mt-2 leading-relaxed font-sans">{authorBio}</p>
          )}
        </div>
      </div>
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

  useEffect(() => {
    if (slug) articlesService.incrementViews(slug).catch(() => {});
  }, [slug]);

  const article = data?.data?.data?.article;
  const related: Article[] = (data?.data?.data as any)?.related ?? [];
  const authorName = article?.isGuestAuthor && article?.guestAuthorName ? article.guestAuthorName : article?.author?.name;

  if (isLoading) {
    return (
      <>
        <ReadingProgress />
        <div className="container-site py-16 max-w-3xl mx-auto space-y-5 animate-pulse">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-200 rounded" />
          <div className="h-7 w-2/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
          <div className="h-72 bg-gray-200 mt-8" />
          <div className="space-y-3 mt-8">
            {[100,95,90,85,75,80].map((w,i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <div className="container-site py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-ink mb-3">Article not found</h2>
        <p className="text-ink-muted mb-6 font-sans text-sm">The article you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    );
  }

  const hasCorrections = article.corrections && article.corrections.length > 0;

  return (
    <>
      <ReadingProgress />
      <article className="bg-white">
        <div className="container-site py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Article Body */}
            <div className="lg:col-span-8">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-[10px] text-ink-muted mb-6 font-sans">
                <Link to="/" className="hover:text-brand-navy transition-colors flex items-center gap-1">
                  <ArrowLeft size={11} /> Home
                </Link>
                {article.category && (
                  <>
                    <span className="text-ink-faint">/</span>
                    <Link to={`/category/${article.category.slug}`}
                      className="hover:text-brand-navy transition-colors capitalize">
                      {article.category.name}
                    </Link>
                  </>
                )}
              </nav>

              {/* Article Header */}
              <header className="mb-8">
                {/* Labels */}
                <div className="flex items-center flex-wrap gap-2 mb-4">
                  {article.isBreaking && (
                    <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-brand-red text-white">Breaking</span>
                  )}
                  {article.isVerified && (
                    <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-accent-emerald/10 text-accent-emerald">✓ Verified</span>
                  )}
                  {article.isEditorsPick && (
                    <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-brand-yellow text-brand-navy">Editor's Pick</span>
                  )}
                  {article.category && (
                    <Link to={`/category/${article.category.slug}`}
                      className="text-[9px] font-black tracking-[2px] uppercase text-brand-red hover:underline font-sans">
                      {article.category.name}
                    </Link>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-ink leading-tight mb-4 text-balance">
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p className="text-lg md:text-xl text-ink-secondary font-sans leading-relaxed font-light mb-6">{article.subtitle}</p>
                )}

                {/* Meta bar */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4 border-y border-gray-200">
                  <div className="flex items-center gap-2.5">
                    {article.author?.avatar ? (
                      <img src={article.author.avatar} alt={authorName}
                        className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-yellow font-bold text-[12px]">{authorName?.[0] ?? 'A'}</span>
                      </div>
                    )}
                    <div>
                      {!article.isGuestAuthor ? (
                        <Link to={`/author/${article.author?._id}`}
                          className="text-[13px] font-semibold text-ink hover:text-brand-navy transition-colors font-sans block">
                          {authorName}
                        </Link>
                      ) : (
                        <span className="text-[13px] font-semibold text-ink font-sans">{authorName}</span>
                      )}
                      {article.author?.designation && (
                        <span className="text-[10px] text-ink-muted font-sans">{article.author.designation}</span>
                      )}
                    </div>
                  </div>
                  <div className="badge-minimal">
                    <Calendar size={11} />
                    <span>{formatDateLong(article.publishedAt ?? article.createdAt)}</span>
                  </div>
                  {article.readTime > 0 && (
                    <div className="badge-minimal">
                      <Clock size={11} />
                      <span>{article.readTime} min read</span>
                    </div>
                  )}
                  {(article.views ?? 0) > 0 && (
                    <div className="badge-minimal">
                      <Eye size={11} />
                      <span>{article.views.toLocaleString()} views</span>
                    </div>
                  )}
                  <button className="ml-auto badge-minimal hover:text-brand-navy transition-colors">
                    <Bookmark size={13} /> Save
                  </button>
                </div>
              </header>

              {/* Corrections banner */}
              {hasCorrections && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex items-start gap-2">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[1.5px] text-amber-800 mb-1 font-sans">Correction</p>
                    {article.corrections!.map((c, i) => (
                      <p key={i} className="text-[12px] text-amber-900 font-sans">{c.note}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Image */}
              {article.featuredImage?.url && (
                <figure className="mb-8 -mx-4 md:mx-0">
                  <img src={article.featuredImage.url}
                    alt={article.featuredImage.alt ?? article.title}
                    className="w-full max-h-[520px] object-cover" />
                  {(article.featuredImage.caption || article.featuredImage.credit) && (
                    <figcaption className="text-[11px] text-ink-muted mt-2 px-4 md:px-0 font-sans">
                      {article.featuredImage.caption}
                      {article.featuredImage.credit && (
                        <span className="ml-1 italic">· {article.featuredImage.credit}</span>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Series badge */}
              {article.series && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-surface-secondary border-l-4 border-brand-navy">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[2px] text-ink-muted font-sans">Part {article.seriesPart} of a series</p>
                    <p className="text-[13px] font-serif font-semibold text-ink">{article.series}</p>
                  </div>
                </div>
              )}

              {/* Article Body */}
              {article.body ? (
                <div
                  className="prose-article"
                  dangerouslySetInnerHTML={{ __html: article.body }}
                />
              ) : (
                <div className="prose-article">
                  <p className="text-ink-secondary">{article.excerpt}</p>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10">
                  {article.tags.map(tag => (
                    <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}
                      className="text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border border-gray-200 text-ink-muted hover:bg-ink hover:text-white hover:border-ink transition-all font-sans">
                      {tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share bar */}
              <ShareBar article={article} />

              {/* Author card */}
              <AuthorCard article={article} />

              {/* Newsletter CTA */}
              <div className="bg-brand-navy text-white p-6 mt-10">
                <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-yellow mb-2 font-sans">Subscribe</p>
                <h3 className="font-serif font-bold text-xl mb-2">Stories like this in your inbox.</h3>
                <p className="text-white/50 text-[12px] mb-4 font-sans">Independent journalism on human rights. Free, weekly.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="your@email.com"
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/25 px-3 py-2.5 text-sm outline-none focus:border-brand-yellow/50 font-sans" />
                  <button className="bg-brand-yellow text-brand-navy font-black text-[10px] uppercase tracking-[2px] px-4 hover:bg-yellow-400 transition-colors font-sans flex-shrink-0">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Support sticky */}
              <div className="sticky top-24">
                <div className="border-2 border-brand-navy p-5 mb-6">
                  <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-2 font-sans">Support The Asr</p>
                  <p className="font-serif font-bold text-[15px] text-ink mb-4 leading-snug">Help us publish more journalism like this.</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {['₹200', '₹500', '₹1000', '₹2500'].map(a => (
                      <button key={a}
                        className="border border-gray-200 text-ink text-[11px] font-bold py-2 hover:bg-brand-navy hover:text-brand-yellow hover:border-brand-navy transition-all font-sans">
                        {a}
                      </button>
                    ))}
                  </div>
                  <Link to="/support"
                    className="block text-center bg-brand-navy text-brand-yellow font-black text-[10px] uppercase tracking-[2px] py-3 hover:bg-brand-navy-dark transition-colors font-sans">
                    Donate →
                  </Link>
                </div>

                {/* Related articles */}
                {related.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-4 border-b-2 border-ink pb-3 font-sans">Related Stories</p>
                    <div className="space-y-0">
                      {related.slice(0, 5).map(art => (
                        <ArticleCard key={art._id} article={art} variant="text-only" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
