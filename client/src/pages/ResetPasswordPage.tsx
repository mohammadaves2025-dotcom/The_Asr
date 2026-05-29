import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordValid = Object.values(checks).every(Boolean);
  const matches = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) { setError('Please meet all password requirements.'); return; }
    if (!matches) { setError('Passwords do not match.'); return; }
    setError('');
    setLoading(true);
    try {
      await api.patch(`/auth/reset-password/${token}`, { password });
      setDone(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'This reset link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const CheckItem = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={`flex items-center gap-1.5 text-xs font-sans transition-colors ${ok ? 'text-green-600' : 'text-ink-muted'}`}>
      <CheckCircle2 size={12} className={ok ? 'opacity-100' : 'opacity-30'} />
      {label}
    </li>
  );

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
              Create a new password.
            </h2>
            <p className="text-white/60 text-base font-sans">
              Choose something strong and unique. You won't need to remember it right now.
            </p>
          </div>
          <p className="text-xs text-white/30 font-sans">
            &copy; {new Date().getFullYear()} Maktoob Media
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-sans text-ink-muted hover:text-ink mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>

          {done ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-5">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-ink mb-3">Password updated!</h1>
              <p className="text-sm text-ink-muted font-sans mb-2">
                Your password has been reset successfully.
              </p>
              <p className="text-xs text-ink-muted font-sans mb-6">Redirecting you to sign in…</p>
              <Link to="/login" className="btn-primary text-sm">Sign In Now</Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-serif font-bold text-ink mb-2">Set new password</h1>
              <p className="text-sm text-ink-muted font-sans mb-8">
                Choose a strong password for your Maktoob account.
              </p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-status-error px-4 py-3 mb-6 text-sm font-sans">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-2 border-gray-200 px-4 py-3 pr-11 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                      <CheckItem ok={checks.length} label="8+ characters" />
                      <CheckItem ok={checks.upper} label="Uppercase" />
                      <CheckItem ok={checks.lower} label="Lowercase" />
                      <CheckItem ok={checks.number} label="Number" />
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold font-sans uppercase tracking-widest text-ink-muted mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={`w-full border-2 px-4 py-3 text-sm font-sans text-ink outline-none transition-colors ${
                      confirm.length > 0
                        ? matches
                          ? 'border-green-400 focus:border-green-500'
                          : 'border-red-300 focus:border-red-400'
                        : 'border-gray-200 focus:border-brand-navy'
                    }`}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !passwordValid || !matches}
                  className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-70"
                >
                  {loading ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
