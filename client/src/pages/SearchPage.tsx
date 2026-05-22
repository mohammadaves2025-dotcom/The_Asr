import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { articlesService } from '../services/articles';
import ArticleCard from '../components/article/ArticleCard';
import { ArticleCardSkeleton } from '../components/common/Skeleton';
import { useState } from 'react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [input, setInput] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => articlesService.getArticles({ search: q, limit: 20 }),
    enabled: q.length > 1,
  });

  const articles = data?.data?.articles || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  return (
    <div className="container-site py-10">
      {/* Search box */}
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-serif font-bold text-ink mb-6 text-center">Search</h1>
        <form onSubmit={handleSubmit} className="flex gap-0 border-2 border-brand-navy">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search articles, topics, authors..."
            className="flex-1 px-5 py-3.5 text-base font-sans outline-none"
          />
          <button type="submit" className="bg-brand-navy text-brand-yellow px-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-navy-dark transition-colors">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Results */}
      {q && (
        <>
          <p className="text-sm text-ink-muted font-sans mb-6">
            {isLoading ? 'Searching...' : `${articles.length} result${articles.length !== 1 ? 's' : ''} for "${q}"`}
          </p>
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <ArticleCardSkeleton key={i} />)}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-lg text-ink-muted">No results found for &ldquo;{q}&rdquo;</p>
              <p className="text-sm text-ink-muted mt-2">Try different keywords or browse categories.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
