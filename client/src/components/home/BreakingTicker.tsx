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
    <div className="bg-brand-navy border-b-2 border-brand-yellow">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 bg-brand-yellow px-4 py-2 flex items-center gap-2">
          <Zap size={13} className="text-brand-navy fill-current" />
          <span className="text-[11px] font-bold font-sans uppercase tracking-widest text-brand-navy whitespace-nowrap">
            Breaking
          </span>
        </div>

        {/* Ticker */}
        <div className="flex-1 overflow-hidden relative" style={{ height: '36px' }}>
          <div className="flex items-center h-full" style={{ animation: 'ticker 40s linear infinite' }}>
            {doubled.map((item, i) => (
              <Link
                key={`${item._id}-${i}`}
                to={`/article/${item.slug}`}
                className="flex-shrink-0 px-8 text-sm font-sans text-white/90 hover:text-brand-yellow transition-colors whitespace-nowrap no-underline"
              >
                {item.title}
                <span className="mx-6 text-white/30">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
