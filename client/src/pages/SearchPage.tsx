import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService } from '../services/articles';
import type { Article } from '../types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const query = searchParams.get('q') ?? '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => articlesService.getAll({ search: query, status: 'published', limit: 20 }),
    enabled: query.length > 1,
    staleTime: 2 * 60 * 1000,
  });

  const articles: Article[] = data?.data?.data?.articles ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) setSearchParams({ q: q.trim() });
  };

  return (
    <div className="bg-paper min-h-screen">
      {/* Search header */}
      <div className="bg-brand-navy">
        <div className="container-site py-10 md:py-14">
          <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 mb-4 font-sans">Search</p>
          <form onSubmit={handleSearch} className="flex items-end border-b-2 border-brand-yellow pb-2 max-w-2xl">
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search articles, topics, journalists…"
              className="flex-1 bg-transparent text-white text-2xl md:text-3xl font-serif placeholder:text-white/20 outline-none py-2"
            />
            {q && (
              <button type="button" onClick={() => setQ('')}
                className="text-white/40 hover:text-white mr-3 transition-colors">
                <X size={18} />
              </button>
            )}
            <button type="submit" className="text-brand-yellow hover:text-white transition-colors pb-2">
              <Search size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className="container-site py-8 md:py-12">
        {query && (
          <p className="text-[11px] text-ink-muted font-sans mb-6">
            {isLoading ? 'Searching…' : `${articles.length} results for `}
            {!isLoading && <strong className="text-ink">"{query}"</strong>}
          </p>
        )}

        {!query && (
          <p className="text-ink-muted font-sans py-12 text-center">Type a query above to search.</p>
        )}

        {isLoading && (
          <div className="grid md:grid-cols-3 gap-5 animate-pulse">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-200" />)}
          </div>
        )}

        {!isLoading && query && articles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-ink-muted font-sans mb-4">No articles found for "{query}".</p>
            <Link to="/" className="btn-primary">← Back to Home</Link>
          </div>
        )}

        {!isLoading && articles.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {articles.map(art => <ArticleCard key={art._id} article={art} />)}
          </div>
        )}
      </div>
    </div>
  );
}
