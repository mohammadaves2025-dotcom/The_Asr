import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ArticleCard from '../article/ArticleCard';
import type { Article } from '../../types';

interface Props {
  articles: Article[];
}

export default function LatestSection({ articles }: Props) {
  if (!articles.length) return null;

  const [primary, ...rest] = articles;

  return (
    <section className="py-12 border-b border-gray-200">
      <div className="container-site">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Latest</h2>
          <Link to="/latest" className="text-xs font-bold font-sans uppercase tracking-widest text-brand-navy hover:text-brand-navy-dark flex items-center gap-1 transition-colors">
            See all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Primary large card */}
          <div className="lg:col-span-2">
            <ArticleCard article={primary} />
          </div>

          {/* Stacked compact list */}
          <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 pt-6 lg:pt-0 lg:pl-8">
            {rest.slice(0, 5).map((article) => (
              <ArticleCard key={article._id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
