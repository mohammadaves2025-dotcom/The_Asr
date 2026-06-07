import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, ChevronRight, ChevronDown , ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../../services/articles';

// ── "More" dropdown items — static secondary sections ─────────────────────────
const MORE_ITEMS = [
  { label: 'Explainers',           href: '/category/explainers' },
  { label: 'In Their Words',       href: '/in-their-words' },
  { label: 'Science & Technology', href: '/category/science-technology' },
  { label: 'Education & Culture',  href: '/category/education-culture' },
  { label: 'Sports',               href: '/category/sports' },
  { label: 'Entertainment',        href: '/category/entertainment' },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);
  const [searchQ, setSearchQ]         = useState('');
  const [scrolled, setScrolled]       = useState(false);
  const searchRef  = useRef<HTMLInputElement>(null);
  const moreRef    = useRef<HTMLDivElement>(null);

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const categories = data?.data?.data?.categories ?? [];

  // ── Scroll shadow ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Auto-focus search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  // ── Lock scroll when overlays open ──────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  // ── Escape key closes overlays ───────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
        setMoreOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Close More dropdown on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  // Dynamic nav items from backend categories (max 8 to keep bar clean)
  const navItems = [
    { label: 'Home', href: '/' },
    ...categories.slice(0, 8).map((c: any) => ({ label: c.name, href: `/category/${c.slug}` })),
  ];

  return (
    <>
      {/* ── Utility Bar ───────────────────────────────────────────────────────
      <div className="bg-brand-navy text-white">
        <div className="container-site flex items-center justify-between h-9">
          <span className="text-white/40 text-[10px] font-sans tracking-[2px] uppercase hidden sm:block">
            Human Rights · Minorities · Justice
          </span>
          <div className="flex items-center gap-5 ml-auto">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profile"
                  className="text-white/60 hover:text-white transition-colors text-[11px] flex items-center gap-1 font-sans"
                >
                  <User size={10} /> {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-white/60 hover:text-accent-red transition-colors text-[11px] flex items-center gap-1 font-sans"
                >
                  <LogOut size={10} /> Logout
                </button>
              </>
            ) : (
              // Only Sign In — Register removed per client instructions
              <Link
                to="/login"
                className="text-white/50 hover:text-white transition-colors text-[11px] font-sans"
              >
                Sign In
              </Link>
            )}
            <Link
              to="/support"
              className="bg-brand-yellow text-brand-navy px-3 py-1 text-[10px] font-black uppercase tracking-[2px] rounded-md hover:bg-yellow-400 transition-colors"
            >
              Support Us
            </Link>
          </div>
        </div>
      </div> */}

      {/* ── Main Header ─────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-nav' : 'border-b border-gray-200'
        }`}
      >
        {/* Masthead */}
        <div className="container-site py-3 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex items-baseline gap-0">
              <span className="text-[26px] md:text-[30px] font-serif font-black text-brand-navy group-hover:text-brand-red transition-colors leading-none">
                The Orbis Journal
              </span>
            </div>
            <span className="text-[7.5px] font-bold font-sans uppercase tracking-[4px] text-ink-faint hidden sm:block mt-0.5">
              Human Rights · Minorities · Justice
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-ink-muted hover:text-brand-navy hover:bg-surface-secondary transition-all rounded-lg"
              aria-label="Search"
            >
              <Search size={17} strokeWidth={2} />
            </button>
            <Link to="/support" className="hidden md:flex btn-primary py-2 px-4 text-[10px] rounded-lg">
              Support Us
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2.5 text-ink hover:text-brand-navy"
              aria-label="Open menu"
            >
              <Menu size={21} />
            </button>
          </div>
        </div>

        {/* ── Category Nav ─────────────────────────────────────────────────── */}
        <nav className="hidden md:block bg-brand-navy border-t border-white/5">
          <div className="container-site flex items-center overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `flex-shrink-0 px-4 py-2.5 text-[11px] font-bold font-sans uppercase tracking-[1.5px] whitespace-nowrap transition-colors border-b-2 ${
                    isActive
                      ? 'text-brand-yellow border-brand-yellow'
                      : 'text-white/65 border-transparent hover:text-white hover:border-white/30'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            {/* ── More dropdown ─────────────────────────────────────────── */}
            <div className="flex-shrink-0 relative ml-auto" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(v => !v)}
                className={`flex items-center gap-1 px-4 py-2.5 text-[11px] font-bold font-sans uppercase tracking-[1.5px] whitespace-nowrap transition-colors border-b-2 ${
                  moreOpen
                    ? 'text-brand-yellow border-brand-yellow'
                    : 'text-white/65 border-transparent hover:text-white hover:border-white/30'
                }`}
              >
                More
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-0 w-52 bg-white shadow-overlay border border-gray-200 rounded-xl z-50 py-1">
                  {MORE_ITEMS.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2.5 text-[12px] font-sans transition-colors ${
                          isActive
                            ? 'text-brand-navy font-bold bg-surface-secondary'
                            : 'text-ink-secondary hover:text-brand-navy hover:bg-surface-secondary'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* ── Search Overlay ───────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div className="w-full max-w-2xl animate-fade-up">
            {/* Search card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Search size={18} className="text-ink-muted flex-shrink-0" />
                <form onSubmit={handleSearch} className="flex-1">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search articles, topics, journalists…"
                    className="w-full text-lg font-serif text-ink placeholder:text-ink-muted/50 outline-none bg-transparent"
                  />
                </form>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-ink-muted hover:text-ink hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="px-5 py-3 bg-surface-secondary flex items-center justify-between">
                <p className="text-[11px] text-ink-muted font-sans">
                  Press <kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-[10px] text-ink shadow-sm">Enter</kbd> to search
                </p>
                <button
                  onClick={handleSearch as any}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-brand-navy hover:text-brand-red transition-colors font-sans"
                >
                  Search <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Menu ──────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-brand-navy flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-baseline gap-0">
              <span className="text-xl font-serif font-black text-white">The Orbis Journal</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white p-1">
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto divide-y divide-white/5">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-3.5 text-[13px] font-bold uppercase tracking-[1.5px] font-sans transition-colors ${
                    isActive ? 'text-brand-yellow' : 'text-white/60 hover:text-white'
                  }`
                }
              >
                {item.label}
                <ChevronRight size={14} className="opacity-30" />
              </NavLink>
            ))}

            {/* More items in mobile */}
            <div className="px-5 pt-5 pb-2">
              <p className="text-[9px] font-bold uppercase tracking-[3px] text-white/20">More Sections</p>
            </div>
            {MORE_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-5 py-3 text-[12px] font-sans transition-colors border-t border-white/5 ${
                    isActive ? 'text-brand-yellow' : 'text-white/40 hover:text-white'
                  }`
                }
              >
                {item.label}
                <ChevronRight size={13} className="opacity-20" />
              </NavLink>
            ))}

            <div className="px-5 pt-5 pb-2">
              <p className="text-[9px] font-bold uppercase tracking-[3px] text-white/20">More</p>
            </div>
            {[
              { label: 'About Us',    href: '/about' },
              { label: 'Support Us',  href: '/support' },
              { label: 'Write For Us', href: '/submissions' },
              { label: 'Contact',     href: '/contact' },
            ].map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-5 py-3.5 text-[12px] text-white/40 hover:text-white transition-colors font-sans border-t border-white/5"
              >
                {item.label}
                <ChevronRight size={13} className="opacity-20" />
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="text-center border border-white/20 text-white text-[10px] font-black uppercase tracking-[2px] py-3 rounded-lg hover:bg-white/10 transition-colors font-sans"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center border border-white/20 text-white text-[10px] font-black uppercase tracking-[2px] py-3 rounded-lg hover:bg-white/10 transition-colors font-sans"
              >
                Sign In
              </Link>
            )}
            <Link
              to="/support"
              onClick={() => setMobileOpen(false)}
              className="text-center bg-brand-yellow text-brand-navy text-[10px] font-black uppercase tracking-[2px] py-3 rounded-lg hover:bg-yellow-400 transition-colors font-sans"
            >
              Donate
            </Link>
          </div>
        </div>
      )}
    </>
  );
}