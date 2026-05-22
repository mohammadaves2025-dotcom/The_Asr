import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) { setError('Please meet all password requirements.'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          style={{ backgroundImage: "url('https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?auto=compress&cs=tinysrgb&w=800')" }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <Logo variant="light" size="lg" />
          <div>
            <h2 className="text-4xl font-serif font-bold text-white leading-tight mb-4">
              Join thousands of readers who care about accountability.
            </h2>
            <p className="text-white/60 text-base font-sans leading-relaxed">
              Free access to all articles, save stories, follow journalists, and never miss a report.
            </p>
          </div>
          <p className="text-xs text-white/30 font-sans">&copy; {new Date().getFullYear()} Maktoob Media</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl font-serif font-bold text-ink mb-2">Create an account</h1>
          <p className="text-sm text-ink-muted font-sans mb-8">Free access to all Maktoob stories</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-status-error px-4 py-3 mb-6 text-sm font-sans">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border-2 border-gray-200 px-4 py-3 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border-2 border-gray-200 px-4 py-3 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border-2 border-gray-200 px-4 py-3 pr-11 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                  placeholder="Min. 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {[
                    { key: 'length', label: '8+ characters' },
                    { key: 'upper', label: 'Uppercase letter' },
                    { key: 'lower', label: 'Lowercase letter' },
                    { key: 'number', label: 'Number' },
                  ].map(({ key, label }) => (
                    <div key={key} className={`flex items-center gap-1.5 text-xs font-sans ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-status-success' : 'text-ink-muted'}`}>
                      <CheckCircle2 size={12} className={passwordChecks[key as keyof typeof passwordChecks] ? 'text-status-success' : 'text-gray-300'} />
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-70"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-muted font-sans">
            By registering, you agree to our{' '}
            <Link to="/terms" className="text-brand-navy hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-brand-navy hover:underline">Privacy Policy</Link>.
          </p>

          <div className="mt-6 text-center">
            <p className="text-sm text-ink-muted font-sans">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-navy font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
