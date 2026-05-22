import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatDate } from '../../utils/helpers';
import type { Article } from '../../types';

interface Props {
  articles: Article[];
}

export default function OpinionSection({ articles }: Props) {
  if (!articles.length) return null;

  return (
    <section className="py-12 border-b border-gray-200 bg-surface-secondary">
      <div className="container-site">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Opinion & Analysis</h2>
          <Link
            to="/category/opinion-analysis"
            className="text-xs font-bold font-sans uppercase tracking-widest text-brand-navy hover:text-brand-navy-dark flex items-center gap-1 transition-colors"
          >
            More <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <div key={article._id} className="group bg-white border border-gray-100 p-6 hover:shadow-card transition-all duration-300">
              {/* Large quote mark */}
              <div className="text-6xl font-serif text-gray-200 leading-none mb-3 select-none">&ldquo;</div>

              <Link to={`/article/${article.slug}`} className="no-underline block">
                <h3 className="text-xl font-serif font-bold text-ink leading-snug line-clamp-4 group-hover:text-brand-navy transition-colors">
                  {article.title}
                </h3>
              </Link>

              <p className="text-sm text-ink-secondary mt-3 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-100">
                {article.author.avatar && (
                  <img src={article.author.avatar} alt={article.author.name} className="w-9 h-9 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold text-ink">{article.author.name}</p>
                  <p className="text-xs text-ink-muted">{formatDate(article.publishedAt || article.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
