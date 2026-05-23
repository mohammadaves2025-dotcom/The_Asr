import { useParams, Link } from 'react-router-dom';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { categoriesService, articlesService } from '../services/articles';
import ArticleCard from '../components/article/ArticleCard';
import { ArticleCardSkeleton } from '../components/common/Skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesService.getOne(slug!),
    enabled: !!slug,
  });

  const cat = catData?.data?.category;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['articles', 'category', slug],
    queryFn: ({ pageParam = 1 }) =>
      articlesService.getArticles({ category: slug, page: pageParam, limit: 12 }),
    getNextPageParam: (last) =>
      last.meta?.hasNextPage ? (last.meta.page + 1) : undefined,
    enabled: !!slug,
    initialPageParam: 1,
  });

  const articles = data?.pages.flatMap((p) => p.data?.articles || []) || [];

  return (
    <div>
      {/* Category header */}
      <div className="border-b-4" style={{ borderColor: cat?.color || '#122837' }}>
        <div className="container-site py-8">
          {cat ? (
            <>
              <p className="text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">Category</p>
              <h1 className="text-4xl font-serif font-bold text-ink" style={{ color: cat.color }}>{cat.name}</h1>
              {cat.description && (
                <p className="text-base text-ink-secondary mt-3 max-w-2xl">{cat.description}</p>
              )}
            </>
          ) : (
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          )}
        </div>
      </div>

      {/* Articles grid */}
      <div className="container-site py-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ink-muted font-sans text-lg">No articles found in this category yet.</p>
            <Link to="/" className="btn-secondary mt-6 inline-flex">Browse all articles</Link>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="btn-secondary"
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load More Articles'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
