import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesService, articlesService } from '../services/articles';
import ArticleCard from '../components/article/ArticleCard';

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-200 mb-3" />
      <div className="h-4 bg-gray-200 mb-2 rounded" />
      <div className="h-4 bg-gray-200 w-3/4 rounded" />
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const LIMIT = 12;

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getBySlug(slug!),
    enabled: !!slug,
  });

  // category shape: res.data.data.category
  const cat = catData?.data?.data?.category;

  const { data, isLoading } = useQuery({
    queryKey: ['articles', 'category', slug, page],
    queryFn: () => articlesService.getAll({
      category: slug,
      page,
      limit: LIMIT,
      status: 'published',
    }),
    enabled: !!slug,
  });

  // articles shape: res.data.data.articles
  const articles = data?.data?.data?.articles ?? [];
  const meta = data?.data?.meta;

  return (
    <div>
      {/* Category Header */}
      <div className="border-b-4" style={{ borderColor: cat?.color ?? '#122837' }}>
        <div className="container-site py-8 md:py-12">
          {cat ? (
            <>
              <p className="text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">Section</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink" style={{ color: cat.color }}>
                {cat.name}
              </h1>
              {cat.description && (
                <p className="text-base text-ink-secondary mt-3 max-w-2xl font-sans">{cat.description}</p>
              )}
              <p className="text-sm text-ink-muted mt-2 font-sans">{meta?.total ?? 0} articles</p>
            </>
          ) : (
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-12 w-64 bg-gray-200 rounded" />
            </div>
          )}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container-site py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ink-muted font-sans text-lg mb-6">No articles in this category yet.</p>
            <Link to="/" className="btn-secondary">Browse all stories</Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {articles.map(art => <ArticleCard key={art._id} article={art} />)}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button disabled={!meta.hasPrevPage}
                  onClick={() => setPage(p => p - 1)}
                  className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  ← Previous
                </button>
                <span className="text-sm text-ink-muted font-sans">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button disabled={!meta.hasNextPage}
                  onClick={() => setPage(p => p + 1)}
                  className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed text-sm">
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
