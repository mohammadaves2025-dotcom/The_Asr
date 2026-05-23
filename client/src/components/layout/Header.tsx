import { Link } from 'react-router-dom';
import { Search, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
}

export default function Header({ categories }: Props) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container-site py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center gap-1">
            <span className="text-2xl font-serif font-bold text-brand-navy">Maktoob</span>
            <span className="text-2xl font-serif font-bold text-brand-yellow">.</span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-secondary transition-colors">
              <Search size={20} />
            </button>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {user.avatar && <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />}
                <span className="text-sm text-ink">{user.name}</span>
                <button
                  onClick={() => logout()}
                  className="p-1 hover:bg-red-50 transition-colors text-accent-red"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-xs">
                Sign In
              </Link>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-2">
          <Link
            to="/"
            className="group px-4 py-2 text-xs font-bold font-sans uppercase tracking-widest whitespace-nowrap text-ink hover:text-brand-navy transition-colors"
          >
            Latest
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group px-4 py-2 text-xs font-bold font-sans uppercase tracking-widest whitespace-nowrap text-ink hover:text-brand-navy transition-colors relative"
              title={cat.description || cat.name}
            >
              {cat.name}
              <span
                className="absolute bottom-0 left-4 right-4 h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
                style={{ backgroundColor: cat.color || '#122837' }}
              />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
