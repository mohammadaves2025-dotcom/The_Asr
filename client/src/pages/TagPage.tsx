// ─────────────────────────────────────────────────────────────────────────────
// TagPage.tsx
// client/src/pages/TagPage.tsx
//
// Changes from original:
//  - ?page=N in URL so tag pages are bookmarkable / shareable
//  - "Previous / Next" buttons replaced with numbered Pagination component
//  - Page resets to 1 when the tag param changes
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import Pagination from '../components/common/Pagination';
import { articlesService } from '../services/articles';

const LIMIT = 12;

// See CategoryPage.tsx for why this wrapper + key exists: it forces a full
// remount whenever the tag changes instead of relying on the query and the
// page-reset effect to each separately catch up, closing off the same class
// of stale-content flash.
export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  return <TagPageInner key={tag} tag={tag} />;
}

function TagPageInner({ tag }: { tag?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

  const setPage = (n: number) => {
    setSearchParams(n === 1 ? {} : { page: String(n) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset when tag changes
  useEffect(() => {
    setSearchParams({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag]);

  const { data, isLoading } = useQuery({
    queryKey: ['tag', tag, page],
    queryFn: () =>
      articlesService.getAll({
        tag,
        page,
        limit:  LIMIT,
        status: 'published',
        sort:   '-publishedAt',
      }),
    enabled:   !!tag,
    staleTime: 3 * 60 * 1000,
  });

  const articles   = data?.data?.data?.articles ?? [];
  const total      = data?.data?.meta?.total      ?? 0;
  const totalPages = data?.data?.meta?.totalPages ?? 1;

  return (
    <div className="container-site py-10">

      {/* Header */}
      <header className="mb-8 pb-5 border-b-2 border-brand-navy">
        <nav className="flex items-center gap-1.5 mb-3 text-[10px] font-sans text-ink-muted">
          <Link to="/" className="hover:text-ink transition-colors">
            Home
          </Link>
          <ChevronRight size={10} />
          <span className="text-ink">#{tag}</span>
        </nav>

        <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-1 font-sans">
          Tag
        </p>
        <h1 className="text-4xl font-serif font-bold text-ink">#{tag}</h1>

        {total > 0 && (
          <p className="text-sm text-ink-muted mt-1.5 font-sans">
            {total} article{total !== 1 ? 's' : ''}
            {totalPages > 1 && (
              <span className="ml-1 text-ink-faint">
                — page {page} of {totalPages}
              </span>
            )}
          </p>
        )}
      </header>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <div className="h-48 shimmer mb-3" />
              <div className="h-4 shimmer mb-2 rounded" />
              <div className="h-4 shimmer w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20">
          <p className="text-ink-muted mb-4 font-sans">
            No articles found with this tag.
          </p>
          <Link to="/" className="btn-secondary">
            Browse all stories
          </Link>
        </div>
      ) : (
        <>
          {/* Article grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((art: any) => (
              <ArticleCard key={art._id} article={art} />
            ))}
          </div>

          {/* ── Numbered pagination (replaces Prev/Next buttons) ── */}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}