import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import type { Category } from '../../types';

interface BreakingItem {
  _id: string;
  title: string;
  slug: string;
  category?: Category;
}

interface Props {
  items: BreakingItem[];
}

export default function BreakingTicker({ items }: Props) {
  if (!items.length) return null;

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="bg-brand-navy border-b-2 border-brand-navy">
      <div className="flex items-center">
        {/* Label pill — red background, yellow text */}
        <div className="flex-shrink-0 bg-brand-red px-5 py-2.5 flex items-center gap-2">
          <Zap size={17} className="text-brand-yellow fill-current" />
          <span className="text-[15px] font-black font-sans uppercase tracking-widest text-brand-yellow whitespace-nowrap">
            Breaking
          </span>
        </div>

        {/* Ticker — navy body, yellow links */}
        <div className="flex-1 overflow-hidden relative" style={{ height: '46px' }}>
          <div
            className="flex items-center h-full"
            style={{ animation: 'ticker 40s linear infinite' }}
          >
            {doubled.map((item, i) => (
              <Link
                key={`${item._id}-${i}`}
                to={`/article/${item.slug}`}
                className="flex-shrink-0 px-8 text-[15px] font-sans font-semibold text-brand-yellow hover:text-white transition-colors whitespace-nowrap no-underline"
              >
                {item.title}
                <span className="mx-6 text-brand-yellow/40">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
