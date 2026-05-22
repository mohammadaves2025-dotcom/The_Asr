import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ArticleCard from '../article/ArticleCard';
import type { Article } from '../../types';

interface Props {
  categorySlug: string;
  categoryName: string;
  categoryColor: string;
  articles: Article[];
}

export default function CategorySection({ categorySlug, categoryName, categoryColor, articles }: Props) {
  if (!articles.length) return null;

  const [primary, ...rest] = articles;

  return (
    <section className="py-10 border-b border-gray-200">
      <div className="container-site">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xs font-bold font-sans uppercase tracking-widest pb-2 inline-block border-b-2"
            style={{ borderColor: categoryColor, color: categoryColor }}
          >
            {categoryName}
          </h2>
          <Link
            to={`/category/${categorySlug}`}
            className="text-xs font-bold font-sans uppercase tracking-widest flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: categoryColor }}
          >
            More <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Primary */}
          <div className="md:col-span-2">
            <ArticleCard article={primary} variant="featured-side" />
          </div>

          {/* Side list */}
          <div className="flex flex-col divide-y divide-gray-100 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
            {rest.slice(0, 3).map((article) => (
              <ArticleCard key={article._id} article={article} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
