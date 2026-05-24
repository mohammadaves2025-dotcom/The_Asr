import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService, categoriesService } from '../services/articles';
import type { Article } from '../types';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => (slug ? categoriesService.getBySlug(slug) : Promise.reject()),
    enabled: !!slug,
  });

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'category', slug],
    queryFn: () => articlesService.getAll({ category: slug, status: 'published', limit: 24, sort: '-publishedAt' }),
    enabled: !!slug,
  });

  const category = catData?.data?.data?.category;
  const articles: Article[] = articlesData?.data?.data?.articles ?? [];
  const hero = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="bg-paper min-h-screen">
      {/* Category banner */}
      <div className="bg-brand-navy border-b border-white/10">
        <div className="container-site py-8 md:py-10">
          {category?.description && (
            <div className="mb-1">
              <span className="text-[9px] font-black uppercase tracking-[3px] text-white/30 font-sans">Section</span>
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {category?.name ?? (slug ? slug.replace(/-/g, ' ') : 'Category')}
          </h1>
          {category?.description && (
            <p className="text-white/50 text-[13px] font-sans max-w-xl leading-relaxed">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container-site py-8 md:py-12">
        {isLoading && (
          <div className="grid md:grid-cols-3 gap-5 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-200" />)}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ink-muted font-sans mb-4">No articles found in this section yet.</p>
            <Link to="/" className="btn-primary">← Back to Home</Link>
          </div>
        )}

        {!isLoading && hero && (
          <>
            {/* Hero */}
            <div className="mb-8 pb-8 border-b-2 border-ink">
              <ArticleCard article={hero} variant="featured-side" />
            </div>

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {rest.map(art => <ArticleCard key={art._id} article={art} />)}
              </div>
            )}

            {articles.length >= 24 && (
              <div className="text-center mt-10">
                <button className="btn-secondary">
                  Load More <ArrowRight size={13} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
