import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../../services/articles';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });
  const categories = data?.data?.data?.categories ?? [];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  // Keyboard: Escape closes search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setMobileOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  const navItems = [
    { label: 'Latest', href: '/' },
    ...categories.slice(0, 9).map((c: any) => ({ label: c.name, href: `/category/${c.slug}` })),
  ];

  return (
    <>
      {/* ── Utility Bar ─────────────────────────────────────────────────────── */}
      <div className="bg-brand-navy text-white">
        <div className="container-site flex items-center justify-between h-9">
          <span className="text-white/40 text-[10px] font-sans tracking-[2px] uppercase hidden sm:block">
            Independent · Reader-Funded · Fearless
          </span>
          <div className="flex items-center gap-5 ml-auto">
            {isAuthenticated && user ? (
              <>
                <Link to="/profile"
                  className="text-white/60 hover:text-white transition-colors text-[11px] flex items-center gap-1 font-sans">
                  <User size={10} /> {user.name.split(' ')[0]}
                </Link>
                <button onClick={() => logout()}
                  className="text-white/60 hover:text-accent-red transition-colors text-[11px] flex items-center gap-1 font-sans">
                  <LogOut size={10} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white/50 hover:text-white transition-colors text-[11px] font-sans">Sign In</Link>
                <Link to="/register" className="text-white/50 hover:text-white transition-colors text-[11px] font-sans">Register</Link>
              </>
            )}
            <Link to="/support"
              className="bg-brand-yellow text-brand-navy px-3 py-1 text-[10px] font-black uppercase tracking-[2px] hover:bg-yellow-400 transition-colors">
              Support Us
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ─────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 bg-white transition-all duration-300 ${scrolled ? 'shadow-nav' : 'border-b border-gray-200'}`}>
        {/* Masthead */}
        <div className="container-site py-3 flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 group">
            <div className="flex items-baseline gap-0">
              <span className="text-[28px] md:text-[32px] font-serif font-black text-brand-navy group-hover:text-brand-red transition-colors leading-none">
                The Asr
              </span>
              <span className="text-[28px] md:text-[32px] font-serif font-black text-brand-red leading-none">.</span>
            </div>
            <span className="text-[7.5px] font-bold font-sans uppercase tracking-[4px] text-ink-faint hidden sm:block mt-0.5">
              Human Rights · Minorities · Justice
            </span>
          </Link>

          {/* Center: spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearchOpen(true)}
              className="p-2.5 text-ink-muted hover:text-brand-navy hover:bg-surface-secondary transition-all"
              aria-label="Search">
              <Search size={17} strokeWidth={2} />
            </button>
            <Link to="/newsletter"
              className="hidden md:flex btn-secondary py-2 px-4 text-[10px]">
              Newsletter
            </Link>
            <Link to="/support"
              className="hidden md:flex btn-primary py-2 px-4 text-[10px]">
              Donate
            </Link>
            <button onClick={() => setMobileOpen(true)}
              className="md:hidden p-2.5 text-ink hover:text-brand-navy"
              aria-label="Open menu">
              <Menu size={21} />
            </button>
          </div>
        </div>

        {/* ── Category Nav ─────────────────────────────────────────────────── */}
        <nav className="hidden md:block bg-brand-navy border-t border-white/5">
          <div className="container-site flex items-center overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <NavLink key={item.href} to={item.href} end={item.href === '/'}
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
            <div className="ml-auto flex-shrink-0 pl-4 border-l border-white/10">
              <NavLink to="/verified"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold font-sans uppercase tracking-[1.5px] whitespace-nowrap transition-colors border-b-2 ${
                    isActive ? 'text-brand-yellow border-brand-yellow' : 'text-accent-emerald border-transparent hover:text-white'
                  }`
                }
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald inline-block" />
                Verified
              </NavLink>
            </div>
          </div>
        </nav>
      </header>

      {/* ── Search Overlay ───────────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/97 flex flex-col items-center justify-start pt-28 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
          <div className="w-full max-w-2xl animate-fade-up">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-white/30 mb-6 font-sans">Search The Asr</p>
            <form onSubmit={handleSearch} className="flex items-end border-b-2 border-brand-yellow pb-2">
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Articles, topics, journalists…"
                className="flex-1 bg-transparent text-white text-2xl md:text-3xl font-serif placeholder:text-white/20 outline-none py-2"
              />
              <button type="submit" className="text-brand-yellow hover:text-white transition-colors px-3 pb-2">
                <Search size={22} />
              </button>
            </form>
            <p className="text-white/20 text-xs font-sans mt-4">Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40">Enter</kbd> to search · <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white/40">Esc</kbd> to close</p>
          </div>
          <button onClick={() => setSearchOpen(false)}
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      )}

      {/* ── Mobile Menu ──────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-brand-navy flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-baseline gap-0">
              <span className="text-2xl font-serif font-black text-white">The Asr</span>
              <span className="text-2xl font-serif font-black text-brand-red">.</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white p-1">
              <X size={22} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto divide-y divide-white/5">
            {navItems.map(item => (
              <NavLink key={item.href} to={item.href} end={item.href === '/'}
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
            <div className="px-5 pt-6 pb-2">
              <p className="text-[9px] font-bold uppercase tracking-[3px] text-white/20 mb-3">More</p>
            </div>
            {[
              { label: 'About Us', href: '/about' },
              { label: 'Support Us', href: '/support' },
              { label: 'Newsletter', href: '/newsletter' },
              { label: 'Write For Us', href: '/submissions' },
              { label: 'Contact', href: '/contact' },
            ].map(item => (
              <NavLink key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-5 py-3.5 text-[12px] text-white/40 hover:text-white transition-colors font-sans border-t border-white/5">
                {item.label}
                <ChevronRight size={13} className="opacity-20" />
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 grid grid-cols-2 gap-3">
            <Link to="/newsletter" onClick={() => setMobileOpen(false)}
              className="text-center border border-white/20 text-white text-[10px] font-black uppercase tracking-[2px] py-3 hover:bg-white/10 transition-colors font-sans">
              Newsletter
            </Link>
            <Link to="/support" onClick={() => setMobileOpen(false)}
              className="text-center bg-brand-yellow text-brand-navy text-[10px] font-black uppercase tracking-[2px] py-3 hover:bg-yellow-400 transition-colors font-sans">
              Donate
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
