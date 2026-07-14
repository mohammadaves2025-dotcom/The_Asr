import { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import Pagination from '../components/common/Pagination';
import { articlesService, categoriesService } from '../services/articles';
import type { Article } from '../types';

interface CategoryPageProps {
  /** Hard-coded slug for alias routes like /in-their-words */
  fixedSlug?: string;
}

const LIMIT = 24;

// ── Why the wrapper + key ────────────────────────────────────────────────────
// React Router reuses the same CategoryPage instance across /category/:slug
// navigations (only the slug param changes) — it does not unmount/remount by
// default. That means every piece of state on this page (both queries, the
// page-reset effect) has to independently notice the slug changed and catch
// up on its own, and there's no single moment where everything resets
// together. Under a slow/cold-started backend, that gap can show the
// *previous* category's banner and articles for noticeably longer than a
// flash.
//
// Giving the inner component `key={slug}` sidesteps all of that: React
// throws away the old component instance entirely and mounts a brand new one
// whenever the slug changes, so there is no stale state to catch up on in
// the first place — banner and article list always start fresh together.
export default function CategoryPage({ fixedSlug }: CategoryPageProps) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = paramSlug ?? fixedSlug;
  return <CategoryPageInner key={slug} slug={slug} />;
}

function CategoryPageInner({ slug }: { slug?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

  const setPage = (n: number) => {
    setSearchParams(n === 1 ? {} : { page: String(n) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when slug changes
  useEffect(() => {
    setSearchParams({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => (slug ? categoriesService.getBySlug(slug) : Promise.reject()),
    enabled: !!slug,
  });

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'category', slug, page],
    queryFn: () =>
      articlesService.getAll({
        category:  slug,
        status:    'published',
        limit:     LIMIT,
        page,
        sort:      '-publishedAt',
      }),
    enabled:   !!slug,
    staleTime: 3 * 60 * 1000,
  });

  const category                = catData?.data?.data?.category;
  const articles: Article[]     = articlesData?.data?.data?.articles ?? [];
  const total: number           = articlesData?.data?.meta?.total       ?? 0;
  const totalPages: number      = articlesData?.data?.meta?.totalPages  ?? 1;

  // On page 1 show hero + grid; on subsequent pages show all as grid
  const hero = page === 1 && articles.length > 0 ? articles[0] : null;
  const rest = hero ? articles.slice(1) : articles;

  return (
    <div className="bg-paper min-h-screen">

      {/* ── Category banner ──────────────────────────────────────────────── */}
      <div className="bg-brand-navy border-b border-white/10">
        <div className="container-site py-8 md:py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-4 text-[10px] font-sans text-white/40">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={10} />
            <span className="text-white/70 capitalize">
              {category?.name ?? (slug ? slug.replace(/-/g, ' ') : 'Category')}
            </span>
          </nav>

          {category?.description && (
            <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-1 font-sans">
              Section
            </p>
          )}

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {category?.name ?? (slug ? slug.replace(/-/g, ' ') : 'Category')}
          </h1>

          {category?.description && (
            <p className="text-white/50 text-[13px] font-sans max-w-xl leading-relaxed">
              {category.description}
            </p>
          )}

          {total > 0 && (
            <p className="text-white/25 text-[11px] font-sans mt-3">
              {total} article{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Article grid ─────────────────────────────────────────────────── */}
      <div className="container-site py-8 md:py-12">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 shimmer" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ink-muted font-sans mb-4">
              No articles found in this section yet.
            </p>
            <Link to="/" className="btn-primary">
              ← Back to Home
            </Link>
          </div>
        )}

        {/* Content */}
        {!isLoading && articles.length > 0 && (
          <>
            {/* Hero — only on page 1 */}
            {hero && (
              <div className="mb-8 pb-8 border-b-2 border-ink">
                <ArticleCard article={hero} variant="featured-side" />
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {rest.map((art) => (
                  <ArticleCard key={art._id} article={art} />
                ))}
              </div>
            )}

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