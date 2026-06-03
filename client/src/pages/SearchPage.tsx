// ─────────────────────────────────────────────────────────────────────────────
// SearchPage.tsx
// client/src/pages/SearchPage.tsx
//
// Changes from original:
//  - ?page=N in URL so search result pages are shareable / bookmarkable
//  - "Load More" replaced with numbered Pagination component
//  - Page resets to 1 whenever the query changes
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import Pagination from '../components/common/Pagination';
import { articlesService } from '../services/articles';
import type { Article } from '../types';

const LIMIT = 18;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q')  ?? '';
  const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

  // Derive a local input value from the URL param so the field is controlled
  const setQuery = (q: string) =>
    setSearchParams(q.trim() ? { q: q.trim() } : {});

  const setPage = (n: number) => {
    const next: Record<string, string> = {};
    if (query) next.q = query;
    if (n > 1)  next.page = String(n);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when query changes
  useEffect(() => {
    if (query) setSearchParams({ q: query });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query, page],
    queryFn: () =>
      articlesService.getAll({
        search: query,
        status: 'published',
        limit:  LIMIT,
        page,
        sort:   '-publishedAt',
      }),
    enabled:   query.length > 1,
    staleTime: 2 * 60 * 1000,
  });

  const articles: Article[] = data?.data?.data?.articles ?? [];
  const total: number       = data?.data?.meta?.total      ?? 0;
  const totalPages: number  = data?.data?.meta?.totalPages ?? 1;

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q  = (fd.get('q') as string ?? '').trim();
    if (q) setQuery(q);
  };

  return (
    <div className="bg-paper min-h-screen">

      {/* Search header */}
      <div className="bg-brand-navy">
        <div className="container-site py-10 md:py-14">
          <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-4 font-sans">
            Search
          </p>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-end border-b-2 border-brand-yellow pb-2 max-w-2xl"
          >
            <input
              name="q"
              type="text"
              defaultValue={query}
              key={query}          // re-mount when URL query changes so defaultValue updates
              placeholder="Search articles, topics, journalists…"
              className="flex-1 bg-transparent text-white text-2xl md:text-3xl font-serif placeholder:text-white/20 outline-none py-2"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="text-white/40 hover:text-white mr-3 transition-colors"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              className="text-brand-yellow hover:text-white transition-colors pb-2"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="container-site py-8 md:py-12">

        {/* Result count */}
        {query && (
          <p className="text-[11px] text-ink-muted font-sans mb-6">
            {isLoading ? (
              'Searching…'
            ) : (
              <>
                {total} result{total !== 1 ? 's' : ''} for{' '}
                <strong className="text-ink">"{query}"</strong>
                {totalPages > 1 && (
                  <span className="ml-2 text-ink-faint">
                    — page {page} of {totalPages}
                  </span>
                )}
              </>
            )}
          </p>
        )}

        {/* Prompt */}
        {!query && (
          <p className="text-ink-muted font-sans py-12 text-center">
            Type a query above to search.
          </p>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid md:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200" />
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && query && articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink-muted font-sans mb-4">
              No articles found for "{query}".
            </p>
            <Link to="/" className="btn-primary">
              ← Back to Home
            </Link>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && articles.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {articles.map((art) => (
                <ArticleCard key={art._id} article={art} />
              ))}
            </div>

            {/* ── Numbered pagination (replaces Load More) ── */}
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}