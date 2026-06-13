// client/src/components/layout/BreakingTicker.tsx
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

  const doubled = [...items, ...items];

  return (
    <div
      className="border-b-2 border-brand-navy"
      style={{ background: '#c0392b' }} // ✅ crimson red — matches screenshot
    >
      <div className="flex items-center" style={{ minHeight: '60px' }}>
        {/* Yellow BREAKING pill */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-5"
          style={{ background: '#f5c518', minHeight: '60px' }}
        >
          <Zap size={22} className="text-brand-navy fill-current" />
          <span
            className="font-black font-sans uppercase text-brand-navy whitespace-nowrap"
            style={{ fontSize: '15px', letterSpacing: '0.14em' }}
          >
            Breaking
          </span>
        </div>

        {/* Ticker — crimson body, white bold headlines */}
        <div className="flex-1 overflow-hidden relative" style={{ height: '60px' }}>
          <div
            className="flex items-center h-full"
            style={{ animation: 'ticker 40s linear infinite' }}
          >
            {doubled.map((item, i) => (
              <Link
                key={`${item._id}-${i}`}
                to={`/article/${item.slug}`}
                className="flex-shrink-0 px-8 font-sans font-bold text-white hover:text-yellow-200 transition-colors whitespace-nowrap no-underline"
                style={{ fontSize: '20px' }} // ✅ bumped from 17px for attention
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