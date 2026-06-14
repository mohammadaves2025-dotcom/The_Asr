import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import type { Article } from '../../types';

// ── Most Read ─────────────────────────────────────────────────────────────────
export function MostRead({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <div className="border border-gray-200 p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-ink">
        <TrendingUp size={14} className="text-ink" />
        <h2 className="text-sm font-serif font-bold text-ink">Most Read</h2>
      </div>
      <ol>
        {articles.slice(0, 5).map((art) => (
          <li key={art._id} className="group border-b border-gray-100 last:border-0 py-4 flex items-start gap-3">
            <Link to={`/article/${art.slug}`} className="flex-shrink-0 block w-24 aspect-video rounded-lg overflow-hidden bg-gray-100">
              {art.featuredImage?.url ? (
                <img src={art.featuredImage.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-navy/20 to-brand-navy/5" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/article/${art.slug}`} className="text-[15px] font-serif font-semibold text-ink line-clamp-3 group-hover:text-brand-navy transition-colors block leading-snug">
                {art.title}
              </Link>
              <p className="text-[12px] text-ink-muted mt-1.5 font-sans">{art.readTime}m read</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Popular Stories ───────────────────────────────────────────────────────────
export function PopularStories({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <div className="border border-gray-200 p-5 rounded-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-brand-red">
        <h2 className="text-sm font-serif font-bold text-ink">Popular Stories</h2>
        <span className="text-[9px] font-black uppercase tracking-[2px] text-brand-red font-sans">This Week</span>
      </div>
      <ul className="space-y-4">
        {articles.map((art) => (
          <li key={art._id} className="group flex gap-3 items-start">
            <Link to={`/article/${art.slug}`} className="flex-shrink-0 block w-24 aspect-video rounded-lg overflow-hidden bg-gray-100">
              {art.featuredImage?.url ? (
                <img src={art.featuredImage.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-navy/20 to-brand-navy/5" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/article/${art.slug}`} className="text-[14px] font-serif font-semibold text-ink line-clamp-2 group-hover:text-brand-navy transition-colors block leading-snug">
                {art.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Donate Card — yellow header / navy body, matches brand style ───────────────
export function DonateCard() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="bg-brand-yellow px-5 pt-5 pb-4">
        <p className="text-[11px] font-black uppercase tracking-[3px] text-brand-navy/60 mb-1.5 font-sans">
          Support Independent Journalism
        </p>
        <p className="font-serif font-bold text-[17px] text-brand-navy leading-snug">
          Fearless reporting needs your support.
        </p>
      </div>
      <div className="bg-brand-navy px-5 pt-4 pb-5">
        <p className="text-[13px] text-white/50 font-sans mb-4 leading-relaxed">
          Your contribution keeps our newsroom independent and our journalism free for everyone.
        </p>
        <Link to="/support" className="block text-center bg-brand-yellow text-brand-navy font-black text-[11px] uppercase tracking-[2px] py-3 rounded-lg hover:bg-yellow-300 transition-colors font-sans">
          Donate Now →
        </Link>
      </div>
    </div>
  );
}

// ── Follow Us ─────────────────────────────────────────────────────────────────
export function FollowUs() {
  return (
    <div className="border border-gray-200 p-5 rounded-xl">
      <p className="text-[12px] font-black uppercase tracking-[3px] text-ink-muted mb-4 font-sans">Follow Us</p>
      <div className="grid grid-cols-3 gap-3">
        <a href="https://x.com/TheOrbisJournal" target="_blank" rel="noopener noreferrer" title="Twitter / X"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 hover:bg-black hover:text-white text-ink transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://www.instagram.com/theorbisjournal?igsh=cHBlbWJqMjhzcjY0" target="_blank" rel="noopener noreferrer" title="Instagram"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 hover:bg-gradient-to-br hover:from-pink-500 hover:to-rose-600 hover:text-white text-pink-600 transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
        </a>
        <a href="https://www.facebook.com/share/1DxGLWEwoN/" target="_blank" rel="noopener noreferrer" title="Facebook"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn"
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 hover:bg-sky-700 hover:text-white text-sky-600 transition-all duration-300">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
      </div>
    </div>
  );
}