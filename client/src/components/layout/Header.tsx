import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, ChevronDown, BookMarked } from 'lucide-react';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';
import type { Category } from '../../types';

interface Props {
  categories?: Category[];
}

const NAV_CATEGORIES = [
  { name: 'Human Rights', slug: 'human-rights' },
  { name: 'Ground Reports', slug: 'ground-reports' },
  { name: 'Politics', slug: 'politics-governance' },
  { name: 'Opinion', slug: 'opinion-analysis' },
  { name: 'Gender', slug: 'gender-rights' },
  { name: 'Communal Watch', slug: 'communal-watch' },
];

export default function Header({ categories }: Props) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navCats = categories?.filter((c) => c.isFeatured).slice(0, 6) || NAV_CATEGORIES;

  return (
    <>
      {/* Top bar */}
      <div className="bg-brand-navy text-white">
        <div className="container-site">
          <div className="flex items-center justify-between py-2 text-[11px] font-sans">
            <span className="text-white/60 tracking-wide">Independent. Rights. Accountability.</span>
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="text-white/80 hover:text-brand-yellow transition-colors">Sign In</Link>
                  <Link to="/register" className="bg-brand-yellow text-brand-navy px-3 py-1 font-bold text-[10px] uppercase tracking-widest hover:bg-brand-yellow-dark transition-colors">
                    Subscribe
                  </Link>
                </>
              ) : (
                <span className="text-white/70">Welcome, {user?.name.split(' ')[0]}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          'sticky top-0 z-50 bg-white transition-shadow duration-300',
          scrolled ? 'shadow-nav' : 'border-b border-gray-200'
        )}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 text-xs font-sans font-semibold uppercase tracking-widest text-ink hover:text-brand-navy transition-colors"
              >
                Latest
              </Link>
              {navCats.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="px-3 py-2 text-xs font-sans font-semibold uppercase tracking-widest text-ink-secondary hover:text-brand-navy transition-colors whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-ink-secondary hover:text-brand-navy transition-colors"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded hover:bg-surface-secondary transition-colors"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold">
                        {user?.name[0].toUpperCase()}
                      </div>
                    )}
                    <ChevronDown size={14} className="text-ink-muted" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-card-hover py-1 animate-slide-down z-50">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-surface-secondary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={15} /> My Profile
                      </Link>
                      <Link
                        to="/saved"
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-surface-secondary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BookMarked size={15} /> Saved Articles
                      </Link>
                      {['admin', 'superadmin', 'editor'].includes(user?.role || '') && (
                        <Link
                          to={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-navy font-semibold hover:bg-surface-secondary transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-status-error hover:bg-surface-secondary transition-colors w-full text-left"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block btn-primary text-[11px] px-4 py-2">
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-ink-secondary hover:text-brand-navy transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-200 bg-surface-secondary animate-slide-down">
            <div className="container-site py-3">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <Search size={16} className="text-ink-muted flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, authors..."
                  className="flex-1 bg-transparent text-sm font-sans text-ink placeholder:text-ink-muted outline-none"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-ink-muted hover:text-ink">
                  <X size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white animate-slide-down">
            <div className="container-site py-4 flex flex-col gap-1">
              <Link to="/" className="py-3 text-sm font-sans font-semibold uppercase tracking-widest text-ink border-b border-gray-100" onClick={() => setMobileOpen(false)}>Latest</Link>
              {navCats.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="py-3 text-sm font-sans font-semibold uppercase tracking-widest text-ink-secondary border-b border-gray-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <Link to="/categories" className="py-3 text-sm font-sans font-semibold uppercase tracking-widest text-brand-navy" onClick={() => setMobileOpen(false)}>
                All Categories →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
