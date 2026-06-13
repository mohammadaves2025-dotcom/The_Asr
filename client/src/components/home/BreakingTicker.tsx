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
    <div className="border-b-2 border-brand-navy" style={{ background: '#c0392b' }}>
      <div className="flex items-center" style={{ minHeight: '52px' }}>
        {/* Label pill — yellow background, dark text */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-5"
          style={{ background: '#f5c518', minHeight: '52px' }}
        >
          <Zap size={20} className="text-brand-navy fill-current" />
          <span
            className="font-black font-sans uppercase tracking-widest text-brand-navy whitespace-nowrap"
            style={{ fontSize: '17px', letterSpacing: '0.12em' }}
          >
            Breaking
          </span>
        </div>

        {/* Ticker — crimson body, white links */}
        <div className="flex-1 overflow-hidden relative" style={{ height: '52px' }}>
          <div
            className="flex items-center h-full"
            style={{ animation: 'ticker 40s linear infinite' }}
          >
            {doubled.map((item, i) => (
              <Link
                key={`${item._id}-${i}`}
                to={`/article/${item.slug}`}
                className="flex-shrink-0 px-8 font-sans font-bold text-white hover:text-yellow-200 transition-colors whitespace-nowrap no-underline"
                style={{ fontSize: '17px' }}
              >
                {item.title}
                <span className="mx-6 opacity-50">·</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
