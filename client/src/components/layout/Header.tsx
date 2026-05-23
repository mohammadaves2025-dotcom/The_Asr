import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, LogOut, Menu, X, ChevronDown, User } from 'lucide-react';
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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  return (
    <>
      {/* ── Top strip ──────────────────────────────────────────────────────── */}
      <div className="bg-brand-navy text-white text-[11px] font-sans">
        <div className="container-site flex items-center justify-between h-8">
          <span className="text-white/40 hidden sm:block tracking-wide">
            Independent · Reader-Funded · Fearless
          </span>
          <div className="flex items-center gap-4 ml-auto">
            {isAuthenticated && user ? (
              <>
                <Link to="/profile" className="text-white/60 hover:text-white transition-colors flex items-center gap-1">
                  <User size={11} /> {user.name.split(' ')[0]}
                </Link>
                <button onClick={() => logout()} className="text-white/60 hover:text-accent-red transition-colors flex items-center gap-1">
                  <LogOut size={11} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"    className="text-white/60 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="text-white/60 hover:text-white transition-colors">Register</Link>
              </>
            )}
            <Link to="/support" className="bg-brand-yellow text-brand-navy px-3 py-0.5 text-[10px] font-black uppercase tracking-widest hover:bg-brand-yellow-dark transition-colors">
              Support Us
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main header ────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>
        {/* Masthead */}
        <div className="container-site py-3 md:py-4 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none group">
            <div className="flex items-end gap-0.5">
              <span className="text-3xl md:text-4xl font-serif font-black text-brand-navy group-hover:text-brand-navy-dark transition-colors">
                The Asr
              </span>
              <span className="text-3xl md:text-4xl font-serif font-black text-brand-yellow">.</span>
            </div>
            <span className="text-[8px] font-bold font-sans uppercase tracking-[4px] text-ink-faint hidden sm:block">
              Human Rights · Minorities · Justice
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 text-ink-muted hover:text-brand-navy hover:bg-surface-secondary transition-all"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <Link to="/newsletter" className="hidden md:flex btn-secondary py-2 px-4 text-xs">
              Newsletter
            </Link>
            <Link to="/support" className="hidden md:flex btn-primary py-2 px-4 text-xs">
              Donate
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2.5 text-ink hover:text-brand-navy"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ── Category nav ─────────────────────────────────────────────────── */}
        <nav className="hidden md:block border-t border-gray-100 bg-brand-navy">
          <div className="container-site">
            <ul className="flex items-center overflow-x-auto scrollbar-hide">
              <li>
                <NavLink to="/" end
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive ? 'bg-brand-yellow text-brand-navy' : 'text-white/70 hover:text-white hover:bg-white/10'}`
                  }
                >
                  Latest
                </NavLink>
              </li>
              {categories.slice(0, 10).map((cat) => (
                <li key={cat.slug}>
                  <NavLink to={`/category/${cat.slug}`}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive ? 'bg-brand-yellow text-brand-navy' : 'text-white/70 hover:text-white hover:bg-white/10'}`
                    }
                  >
                    {cat.name}
                  </NavLink>
                </li>
              ))}
              <li className="ml-auto">
                <NavLink to="/in-their-words"
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive ? 'bg-brand-yellow text-brand-navy' : 'text-accent-green hover:text-white hover:bg-white/10'}`
                  }
                >
                  ✓ Verified
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* ── Search overlay ───────────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-brand-navy/95 flex items-start pt-32 px-4">
          <div className="w-full max-w-2xl mx-auto">
            <form onSubmit={handleSearch} className="flex border-b-2 border-brand-yellow pb-1">
              <input
                ref={searchRef}
                type="text"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Search articles, topics, reporters…"
                className="flex-1 bg-transparent text-white text-xl md:text-2xl font-sans placeholder:text-white/30 outline-none py-3"
              />
              <button type="submit" className="text-brand-yellow px-4 hover:text-white transition-colors">
                <Search size={22} />
              </button>
            </form>
            <p className="text-white/30 text-sm font-sans mt-3">Press Enter to search or Esc to close</p>
          </div>
          <button onClick={() => setSearchOpen(false)} className="absolute top-8 right-8 text-white/60 hover:text-white">
            <X size={28} />
          </button>
        </div>
      )}

      {/* ── Mobile menu ──────────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-brand-navy flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-end gap-0.5">
              <span className="text-2xl font-serif font-black text-white">The Asr</span>
              <span className="text-2xl font-serif font-black text-brand-yellow">.</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white p-1">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {[{ label: 'Latest', href: '/' }, ...categories.map(c => ({ label: c.name, href: `/category/${c.slug}` }))].map(item => (
              <NavLink key={item.href} to={item.href} end={item.href === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-6 py-4 font-bold uppercase tracking-widest text-sm border-b border-white/5 transition-colors ${isActive ? 'text-brand-yellow' : 'text-white/70 hover:text-white'}`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="px-6 pt-4 pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-3">More</p>
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Support Us', href: '/support' },
                { label: 'Newsletter', href: '/newsletter' },
                { label: 'Write For Us', href: '/submissions' },
                { label: 'Contact', href: '/contact' },
              ].map(item => (
                <NavLink key={item.href} to={item.href} onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm text-white/50 hover:text-white transition-colors font-sans border-b border-white/5">
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="p-4 border-t border-white/10 flex gap-3">
            <Link to="/newsletter" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center border border-white/20 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-white/10 transition-colors">
              Newsletter
            </Link>
            <Link to="/support" onClick={() => setMobileOpen(false)}
              className="flex-1 text-center bg-brand-yellow text-brand-navy text-xs font-bold uppercase tracking-widest py-3 hover:bg-brand-yellow-dark transition-colors">
              Donate
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
