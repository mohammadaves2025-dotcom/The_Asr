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
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy to-brand-navy-dark text-white border-b-4 border-brand-yellow">
        <div className="container-site">
          <div className="flex items-center justify-between py-2.5 text-[11px] font-sans">
            <span className="font-semibold tracking-widest">Independent. Rights. Accountability.</span>
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="text-white/80 hover:text-brand-yellow transition-colors duration-300 font-medium">Sign In</Link>
                  <div className="w-px h-4 bg-white/20" />
                  <Link to="/register" className="bg-brand-yellow text-brand-navy px-3 py-1.5 font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    Subscribe
                  </Link>
                </>
              ) : (
                <span className="text-white/80 font-medium">Welcome, {user?.name.split(' ')[0]}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header
        className={cn(
          'sticky top-0 z-40 bg-white transition-all duration-500',
          scrolled ? 'shadow-lg border-b border-gray-100/50 backdrop-blur-sm bg-white/95' : 'border-b-2 border-gray-100'
        )}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              <Link
                to="/"
                className="group px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest text-ink relative transition-all duration-300 hover:text-brand-navy"
              >
                Latest
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-yellow transition-all duration-300 group-hover:w-full" />
              </Link>
              {navCats.map((cat: any) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="group px-4 py-3 text-xs font-sans font-semibold uppercase tracking-widest text-ink-secondary hover:text-brand-navy transition-colors duration-300 whitespace-nowrap relative"
                  title={cat.description || cat.name}
                >
                  {cat.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: cat.color || '#122837' }} />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-ink-secondary hover:text-brand-navy hover:bg-surface-secondary rounded-lg transition-all duration-300 hover:shadow-sm"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-secondary transition-all duration-300 group"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-brand-yellow transition-all duration-300" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white flex items-center justify-center text-xs font-bold">
                        {user?.name[0].toUpperCase()}
                      </div>
                    )}
                    <ChevronDown size={14} className="text-ink-muted transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 shadow-2xl py-2 rounded-xl animate-fade-in z-50 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-semibold text-ink uppercase tracking-widest opacity-60">Account</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-surface-secondary transition-colors duration-200 group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={15} className="group-hover:text-brand-navy transition-colors" /> My Profile
                      </Link>
                      <Link
                        to="/saved"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:bg-surface-secondary transition-colors duration-200 group"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <BookMarked size={15} className="group-hover:text-brand-navy transition-colors" /> Saved Articles
                      </Link>
                      {['admin', 'superadmin', 'editor'].includes(user?.role || '') && (
                        <>
                          <div className="border-t border-gray-100 my-1" />
                          <a
                            href={import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174'}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-navy font-semibold hover:bg-brand-navy/5 transition-colors duration-200"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="text-xs px-2 py-1 bg-brand-yellow/20 rounded text-brand-navy font-bold">ADMIN</span> CMS
                          </a>
                        </>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-status-error hover:bg-red-50 transition-colors duration-200 w-full text-left"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden sm:block btn-primary text-[11px] px-4 py-2.5">
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 text-ink-secondary hover:text-brand-navy hover:bg-surface-secondary rounded-lg transition-all duration-300"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-gradient-to-b from-surface-secondary to-surface animate-fade-in">
            <div className="container-site py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-3 bg-white border-2 border-brand-navy rounded-lg px-4 py-2.5 focus-within:shadow-lg transition-shadow duration-300">
                <Search size={16} className="text-brand-navy flex-shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, topics, authors..."
                  className="flex-1 bg-transparent text-sm font-sans text-ink placeholder:text-ink-muted outline-none"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-ink-muted hover:text-ink transition-colors">
                    <X size={16} />
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white animate-fade-in">
            <div className="container-site py-3 flex flex-col gap-0.5">
              <Link to="/" className="py-3 px-3 text-sm font-sans font-semibold uppercase tracking-widest text-ink hover:text-brand-navy hover:bg-surface-secondary rounded transition-colors duration-200" onClick={() => setMobileOpen(false)}>Latest</Link>
              {navCats.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/category/${cat.slug}`}
                  className="py-3 px-3 text-sm font-sans font-semibold uppercase tracking-widest text-ink-secondary hover:text-brand-navy hover:bg-surface-secondary rounded transition-colors duration-200"
                  onClick={() => setMobileOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-gray-100 my-1" />
              <Link to="/categories" className="py-3 px-3 text-sm font-sans font-semibold uppercase tracking-widest text-brand-navy hover:bg-brand-navy/5 rounded transition-colors duration-200" onClick={() => setMobileOpen(false)}>
                All Categories
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
