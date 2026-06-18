// client/src/pages/FormatPage.tsx
//
// Lists articles by content type / classification (Just In, Opinion & Analysis,
// Investigation, Ground Report, Double Lens, Verified Report, Through the Lens,
// Explainer, Interview, Community Voice) — i.e. the same "Content Type" field
// set in the admin article editor's Classification panel.
//
// This is distinct from CategoryPage: categories are topical sections (e.g.
// "Politics & Governance"), while content type is the article's *format*.
// The backend already supports filtering articles by ?contentType= directly
// (see backend/src/controllers/articleController.js), so this page calls
// that filter rather than going through a Category lookup.

import { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import Pagination from '../components/common/Pagination';
import { articlesService } from '../services/articles';
import type { Article } from '../types';

// ── Labels & descriptions — matches backend CONTENT_TYPES enum exactly ────────
// (backend/src/models/Article.js). Keep this in sync if that enum changes.
const FORMAT_META: Record<string, { label: string; description: string }> = {
  'news':              { label: 'Just In',           description: 'The latest news as it happens.' },
  'investigation':     { label: 'Investigation',     description: 'In-depth investigative reporting.' },
  'opinion':           { label: 'Opinion & Analysis', description: 'Editorials and expert commentary.' },
  'ground-report':     { label: 'Ground Report',     description: 'Field journalism from affected communities.' },
  'double-lens':       { label: 'Double Lens',       description: 'Two perspectives, one story.' },
  'verified-report':   { label: 'Verified Report',   description: 'Fact-checked, evidence-backed reporting.' },
  'photo-essay':       { label: 'Through the Lens',  description: 'Stories told through photography.' },
  'explainer':         { label: 'Explainer',         description: 'Breaking down complex issues, simply.' },
  'interview':         { label: 'Interview',         description: 'Conversations with people who matter.' },
  'community-voices':  { label: 'Community Voice',   description: 'First-person testimonials from affected people.' },
};

interface FormatPageProps {
  /** Hard-coded contentType for alias routes, if ever needed */
  fixedType?: string;
}

const LIMIT = 24;

export default function FormatPage({ fixedType }: FormatPageProps) {
  const { type: paramType } = useParams<{ type: string }>();
  const type = paramType ?? fixedType;

  const meta = type ? FORMAT_META[type] : undefined;

  // ── Page state lives in URL (?page=N) so links are shareable ─────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));

  const setPage = (n: number) => {
    setSearchParams(n === 1 ? {} : { page: String(n) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when type changes
  useEffect(() => {
    setSearchParams({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'format', type, page],
    queryFn: () =>
      articlesService.getAll({
        contentType: type,
        status:      'published',
        limit:       LIMIT,
        page,
        sort:        '-publishedAt',
      }),
    enabled:   !!type,
    staleTime: 3 * 60 * 1000,
  });

  const articles: Article[]  = articlesData?.data?.data?.articles ?? [];
  const total: number        = articlesData?.data?.meta?.total      ?? 0;
  const totalPages: number   = articlesData?.data?.meta?.totalPages ?? 1;

  // On page 1 show hero + grid; on subsequent pages show all as grid
  const hero = page === 1 && articles.length > 0 ? articles[0] : null;
  const rest = hero ? articles.slice(1) : articles;

  const displayLabel = meta?.label ?? (type ? type.replace(/-/g, ' ') : 'Format');

  return (
    <div className="bg-paper min-h-screen">

      {/* ── Format banner ─────────────────────────────────────────────────── */}
      <div className="bg-brand-navy border-b border-white/10">
        <div className="container-site py-8 md:py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-4 text-[10px] font-sans text-white/40">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={10} />
            <span className="text-white/70 capitalize">{displayLabel}</span>
          </nav>

          {meta?.description && (
            <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-1 font-sans">
              Format
            </p>
          )}

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
            {displayLabel}
          </h1>

          {meta?.description && (
            <p className="text-white/50 text-[13px] font-sans max-w-xl leading-relaxed">
              {meta.description}
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
          <div className="grid md:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-ink-muted font-sans mb-4">
              No articles found in this format yet.
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

            {/* ── Numbered pagination ── */}
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