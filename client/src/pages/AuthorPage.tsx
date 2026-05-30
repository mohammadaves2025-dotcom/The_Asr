import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService } from '../services/articles';
import { formatDate } from '../utils/helpers';
import { ChevronRight } from 'lucide-react';

export default function AuthorPage() {
  const { id } = useParams<{ id: string }>();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['author', id],
    queryFn: () => api.get(`/users/${id}/profile`),
    enabled: !!id,
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['author-articles', id],
    queryFn: () => articlesService.getAll({ author: id, status: 'published', limit: 12 }),
    enabled: !!id,
  });

  const author = profileData?.data?.data?.user;
  const articles = articlesData?.data?.data?.articles ?? [];

  if (profileLoading) {
    return (
      <div className="container-site py-16 animate-pulse">
        <div className="flex gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 w-48 rounded" />
            <div className="h-4 bg-gray-200 w-32 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container-site py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-ink mb-3">Author not found</h2>
        <Link to="/" className="btn-secondary">Go Home</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Author header */}
      <div className="bg-brand-navy text-white">
        <div className="container-site py-12 md:py-16">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-6 text-[10px] font-sans text-white/40">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={10} />
            <span className="text-white/70">{author.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {author.avatar ? (
              <img src={author.avatar} alt={author.name}
                className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-brand-yellow flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
                <span className="text-brand-navy text-3xl font-serif font-black">{author.name[0]}</span>
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-1">Reporter / Author</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{author.name}</h1>
              {author.designation && <p className="text-white/60 text-sm font-sans mb-3">{author.designation}</p>}
              {author.bio && <p className="text-white/70 font-sans text-sm leading-relaxed max-w-2xl">{author.bio}</p>}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-white/40 text-xs font-sans">
                  {articles.length} article{articles.length !== 1 ? 's' : ''} published
                </span>
                {author.lastLogin && (
                  <span className="text-white/40 text-xs font-sans">
                    · Member since {formatDate(author.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div className="container-site py-10">
        <h2 className="text-xl font-serif font-bold text-ink mb-6 pb-3 border-b-2 border-brand-navy">
          Articles by {author.name}
        </h2>
        {articlesLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
            {[1,2,3].map(i => (
              <div key={i}>
                <div className="h-48 bg-gray-200 mb-3" />
                <div className="h-4 bg-gray-200 mb-2 rounded" />
                <div className="h-4 bg-gray-200 w-3/4 rounded" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-ink-muted py-16 text-center font-sans">No articles published yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map(art => <ArticleCard key={art._id} article={art} />)}
          </div>
        )}
      </div>
    </div>
  );
}
