import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import ArticleCard from '../components/article/ArticleCard';

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['tag', tag, page],
    queryFn: () => articlesService.getAll({ tag, page, limit: 12, status: 'published' }),
    enabled: !!tag,
  });

  const articles = data?.data?.data?.articles ?? [];
  const meta = data?.data?.meta;

  return (
    <div className="container-site py-10">
      <header className="mb-8 pb-5 border-b-2 border-brand-navy">
        <p className="section-label text-ink-muted mb-1">Tag</p>
        <h1 className="text-4xl font-serif font-bold text-ink">#{tag}</h1>
        {meta && <p className="text-sm text-ink-muted mt-1 font-sans">{meta.total} articles</p>}
      </header>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i}>
              <div className="h-48 bg-gray-200 mb-3" />
              <div className="h-4 bg-gray-200 mb-2 rounded" />
              <div className="h-4 bg-gray-200 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-ink-muted mb-4">No articles found with this tag.</p>
          <Link to="/" className="btn-secondary">Browse all stories</Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(art => <ArticleCard key={art._id} article={art} />)}
          </div>
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}
                className="btn-secondary text-sm disabled:opacity-40">← Previous</button>
              <span className="text-sm text-ink-muted font-sans">Page {meta.page} of {meta.totalPages}</span>
              <button disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}
                className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
