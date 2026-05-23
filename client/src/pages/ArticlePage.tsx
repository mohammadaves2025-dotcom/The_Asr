import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart, Share2 } from 'lucide-react';
import ContentTypeBadge from '../components/common/ContentTypeBadge';
import { articlesService } from '../services/articles';
import { formatDateLong } from '../utils/helpers';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => (slug ? articlesService.getBySlug(slug) : Promise.reject('No slug')),
    enabled: !!slug,
  });

  const article = data?.data?.data?.article;

  if (isLoading) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-ink-muted">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-accent-red">Article not found.</p>
      </div>
    );
  }

  return (
    <article className="bg-white">
      <div className="container-site py-12">
        <div className="max-w-3xl mx-auto">
          <ContentTypeBadge type={article.type} className="mb-4" />

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-6 leading-tight">{article.title}</h1>

          <div className="flex items-center gap-4 pb-8 border-b border-gray-200">
            {article.author.avatar && (
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-brand-yellow"
              />
            )}
            <div>
              <p className="font-semibold text-ink">{article.author.name}</p>
              <p className="text-sm text-ink-muted">{formatDateLong(article.publishedAt || article.createdAt)}</p>
            </div>
          </div>

          <div className="my-8">
            <img src={article.featuredImage} alt={article.title} className="w-full h-96 object-cover" />
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-gray-200">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-accent-red transition-colors">
              <Heart size={18} />
              <span>Save</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-surface-secondary transition-colors">
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
