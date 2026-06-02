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
    // Changed: bg-brand-red (sharp red) instead of bg-brand-navy
    // Changed: border-brand-red to unify the strip
    <div className="bg-brand-red border-b-2 border-brand-red">
      <div className="flex items-center">
        {/* Label pill — stays yellow for contrast */}
        <div className="flex-shrink-0 bg-brand-yellow px-4 py-2 flex items-center gap-2">
          <Zap size={13} className="text-brand-navy fill-current" />
          {/* Increased tracking and slightly larger text */}
          <span className="text-[11px] font-black font-sans uppercase tracking-widest text-brand-navy whitespace-nowrap">
            Breaking
          </span>
        </div>

        {/* Ticker */}
        <div className="flex-1 overflow-hidden relative" style={{ height: '38px' }}>
          <div
            className="flex items-center h-full"
            style={{ animation: 'ticker 40s linear infinite' }}
          >
            {doubled.map((item, i) => (
              <Link
                key={`${item._id}-${i}`}
                to={`/article/${item.slug}`}
                // Changed: text-white (full opacity) + larger text-[13px] from text-sm
                className="flex-shrink-0 px-8 text-[13px] font-sans font-medium text-white hover:text-brand-yellow transition-colors whitespace-nowrap no-underline"
              >
                {item.title}
                <span className="mx-6 text-white/40">|</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}