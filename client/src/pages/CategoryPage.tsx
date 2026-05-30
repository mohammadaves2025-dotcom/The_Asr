import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService, categoriesService } from '../services/articles';
import type { Article } from '../types';

interface CategoryPageProps {
  /** Hard-coded slug for alias routes like /verified, /in-their-words */
  fixedSlug?: string;
}

export default function CategoryPage({ fixedSlug }: CategoryPageProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = paramSlug ?? fixedSlug;
  const [page, setPage] = useState(1);

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => (slug ? categoriesService.getBySlug(slug) : Promise.reject()),
    enabled: !!slug,
  });

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'category', slug, page],
    queryFn: () => articlesService.getAll({ category: slug, status: 'published', limit: 24, page, sort: '-publishedAt' }),
    enabled: !!slug,
  });

  const category = catData?.data?.data?.category;
  const articles: Article[] = articlesData?.data?.data?.articles ?? [];
  const total: number = articlesData?.data?.data?.total ?? 0;
  const hero = page === 1 ? articles[0] : null;
  const rest = page === 1 ? articles.slice(1) : articles;

  return (
    <div className="bg-paper min-h-screen">
      {/* Category banner */}
      <div className="bg-brand-navy border-b border-white/10">
        <div className="container-site py-8 md:py-10">

          {/* Breadcrumb */}

          <nav className="flex items-center gap-1.5 mb-4 text-[10px] font-sans text-white/40">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-white/70">
              {category?.name ?? (slug ? slug.replace(/-/g, ' ') : 'Category')}
            </span>
          </nav>

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
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-gray-200" />)}
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

            {articles.length >= 24 && (page * 24) < total && (
              <div className="text-center mt-10">
                <button
                  className="btn-secondary"
                  onClick={() => setPage((p) => p + 1)}
                >
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
