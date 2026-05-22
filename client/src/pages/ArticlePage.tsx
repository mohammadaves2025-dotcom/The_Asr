import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Clock, Eye, Share2, BookMarked, Calendar, MapPin, CircleAlert as AlertCircle } from 'lucide-react';
import { articlesService } from '../services/articles';
import CategoryBadge from '../components/common/CategoryBadge';
import ContentTypeBadge from '../components/common/ContentTypeBadge';
import ArticleCard from '../components/article/ArticleCard';
import NewsletterInline from '../components/newsletter/NewsletterInline';
import { formatDateLong, formatReadTime } from '../utils/helpers';
import { SkeletonBox } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useState } from 'react';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => articlesService.getArticle(slug!),
    enabled: !!slug,
  });

  const article = data?.data?.article;
  const related = data?.data?.related || [];

  const handleSave = async () => {
    if (!article) return;
    try {
      await api.patch(`/users/me/saved/${article._id}`);
      setSaved(!saved);
    } catch {}
  };

  const handleShare = async () => {
    if (!article) return;
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="container-site py-10 max-w-4xl">
        <SkeletonBox className="h-4 w-32 mb-4" />
        <SkeletonBox className="h-10 w-full mb-2" />
        <SkeletonBox className="h-10 w-3/4 mb-6" />
        <SkeletonBox className="aspect-video w-full mb-8" />
        <div className="flex flex-col gap-3">
          {[1,2,3,4,5].map(i => <SkeletonBox key={i} className="h-4 w-full" />)}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-site py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-ink-muted mb-4" />
        <h2 className="text-2xl font-serif font-bold text-ink mb-2">Article not found</h2>
        <p className="text-ink-muted mb-6">The article you're looking for may have been moved or removed.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Article header */}
      <div className="bg-surface-secondary border-b border-gray-200">
        <div className="container-site py-10 max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-sans text-ink-muted mb-6">
            <Link to="/" className="hover:text-brand-navy transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/category/${article.category.slug}`} className="hover:text-brand-navy transition-colors">{article.category.name}</Link>
            <span>/</span>
            <span className="text-ink line-clamp-1">{article.title}</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <CategoryBadge category={article.category} />
            <ContentTypeBadge type={article.contentType} />
            {article.isBreaking && (
              <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-2 py-0.5 bg-accent-red text-white">
                Breaking
              </span>
            )}
            {article.isVerified && (
              <span className="text-[10px] font-bold font-sans uppercase tracking-widest px-2 py-0.5 bg-accent-emerald text-white">
                Verified
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink leading-tight text-balance">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-xl text-ink-secondary font-sans mt-4 leading-relaxed">{article.subtitle}</p>
          )}

          <p className="text-base text-ink-secondary mt-4 leading-relaxed">{article.excerpt}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-5 border-t border-gray-200">
            <div className="flex items-center gap-3">
              {article.author.avatar ? (
                <img src={article.author.avatar} alt={article.author.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-bold font-sans">
                  {article.author.name[0]}
                </div>
              )}
              <div>
                <Link to={`/author/${article.author._id}`} className="text-sm font-semibold text-ink hover:text-brand-navy transition-colors no-underline">
                  {article.author.name}
                </Link>
                {article.author.designation && (
                  <p className="text-xs text-ink-muted">{article.author.designation}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} /> {formatDateLong(article.publishedAt || article.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {formatReadTime(article.readTime)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye size={12} /> {article.views.toLocaleString()} views
              </span>
              {article.location?.state && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} /> {article.location.state}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="p-2 border border-gray-200 hover:border-brand-navy hover:text-brand-navy transition-colors" title="Share">
                <Share2 size={15} />
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleSave}
                  className={`p-2 border transition-colors ${saved ? 'border-brand-navy bg-brand-navy text-white' : 'border-gray-200 hover:border-brand-navy hover:text-brand-navy'}`}
                  title={saved ? 'Saved' : 'Save article'}
                >
                  <BookMarked size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-site py-10">
        <div className="grid lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Article body */}
          <div className="lg:col-span-2">
            {/* Featured image */}
            {article.featuredImage?.url && (
              <figure className="mb-8">
                <img
                  src={article.featuredImage.url}
                  alt={article.featuredImage.alt || article.title}
                  className="w-full"
                  loading="eager"
                />
                {(article.featuredImage.caption || article.featuredImage.credit) && (
                  <figcaption className="text-xs text-ink-muted mt-2 font-sans">
                    {article.featuredImage.caption}
                    {article.featuredImage.credit && <span className="ml-2 opacity-70">Photo: {article.featuredImage.credit}</span>}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Body */}
            <div
              className="prose prose-lg max-w-none font-sans"
              dangerouslySetInnerHTML={{ __html: article.body || '' }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                <span className="text-xs font-bold font-sans uppercase tracking-widest text-ink-muted">Tags:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tag/${tag}`}
                    className="text-xs font-sans bg-surface-secondary border border-gray-200 px-3 py-1 text-ink-secondary hover:border-brand-navy hover:text-brand-navy transition-colors no-underline"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author bio */}
            {article.author.bio && (
              <div className="bg-surface-secondary border border-gray-200 p-6 mt-8">
                <div className="flex items-start gap-4">
                  {article.author.avatar && (
                    <img src={article.author.avatar} alt={article.author.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-1">About the Author</p>
                    <p className="text-base font-serif font-semibold text-ink">{article.author.name}</p>
                    {article.author.designation && <p className="text-xs text-ink-muted mb-2">{article.author.designation}</p>}
                    <p className="text-sm text-ink-secondary leading-relaxed">{article.author.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {/* Newsletter */}
            <NewsletterInline variant="sidebar" />

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h3 className="section-heading">Related</h3>
                <div className="flex flex-col gap-4">
                  {related.map((r) => (
                    <ArticleCard key={r._id} article={r} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
