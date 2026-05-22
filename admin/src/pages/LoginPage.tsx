import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 mb-3">
            <span className="text-3xl font-serif font-bold text-white">Maktoob</span>
            <span className="text-3xl font-serif font-bold text-brand-yellow">.</span>
          </div>
          <p className="text-xs font-bold font-sans uppercase tracking-widest text-white/30">Content Management System</p>
        </div>

        <div className="bg-white p-8">
          <h2 className="text-xl font-semibold font-sans text-ink mb-1">Admin Sign In</h2>
          <p className="text-sm text-ink-muted font-sans mb-6">Editor, Admin and Superadmin access only</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-accent-red px-4 py-3 mb-5 text-sm font-sans">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="admin-label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="admin-input"
                placeholder="admin@maktoob.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="admin-label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="admin-input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="admin-btn-primary w-full justify-center py-3 text-sm disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In to CMS'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6 font-sans">
          &copy; {new Date().getFullYear()} Maktoob Media
        </p>
      </div>
    </div>
  );
}
