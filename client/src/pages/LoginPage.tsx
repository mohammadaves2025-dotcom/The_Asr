import { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import Logo from '../components/common/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as any)?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    searchParams.get('error') === 'oauth'
      ? 'Google sign-in failed. Please try again or use email and password.'
      : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800')" }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Logo variant="light" size="lg" />
          <div>
            <h2 className="text-4xl font-serif font-bold text-white leading-tight mb-4">
              Independent journalism for accountability and rights.
            </h2>
            <p className="text-white/60 text-base font-sans">
              Sign in to save articles, follow authors, and join our community of engaged readers.
            </p>
          </div>
          <p className="text-xs text-white/30 font-sans">
            &copy; {new Date().getFullYear()} The Orbis Journal Media
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-ink mb-2">Welcome back</h1>
          <p className="text-sm text-ink-muted font-sans mb-8">Sign in to your The Orbis Journal account</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-status-error px-4 py-3 mb-6 text-sm font-sans">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-gray-200 px-4 py-3 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold font-sans uppercase tracking-widest text-ink-muted">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-brand-navy hover:underline font-sans">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border-2 border-gray-200 px-4 py-3 pr-11 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-ink-muted font-sans">
              New to The Orbis Journal?{' '}
              <Link to="/register" className="text-brand-navy font-semibold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

          {/* Google OAuth */}
          <div className="mt-6">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-ink-muted font-sans">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>
            <button
              type="button"
              onClick={() => authService.initiateGoogleOAuth(from)}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 py-3.5 text-sm font-semibold font-sans text-ink hover:border-brand-navy transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" fill="#4285F4"/>
                <path d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" fill="#34A853"/>
                <path d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" fill="#FBBC05"/>
                <path d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
