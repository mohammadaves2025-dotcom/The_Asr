import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService } from '../services/articles';

export default function HomePage() {
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'home'],
    queryFn: () => articlesService.getAll({ limit: 20, status: 'published' }),
    staleTime: 5 * 60 * 1000,
  });

  const articles = articlesData?.data?.data?.articles || [];

  if (isLoading) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-ink-muted">Loading articles...</p>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-ink-muted">No articles found.</p>
      </div>
    );
  }

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="bg-white">
      <div className="container-site py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-navy mb-8">Latest Stories</h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <ArticleCard article={featured} variant="featured-side" />
            </div>

            <div className="flex flex-col divide-y divide-gray-100 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
              {rest.slice(0, 3).map((article) => (
                <ArticleCard key={article._id} article={article} variant="compact" />
              ))}
            </div>
          </div>
        </div>

        <div className="py-12 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">All Articles</h2>
            <Link
              to="/search"
              className="text-xs font-bold font-sans uppercase tracking-widest text-brand-navy hover:text-brand-navy-dark flex items-center gap-1 transition-colors"
            >
              Explore More <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {rest.slice(3).map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
