import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
              We'll help you get back in.
            </h2>
            <p className="text-white/60 text-base font-sans">
              Enter your email and we'll send a secure link to reset your password.
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

          {sent ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-5">
                <CheckCircle2 size={28} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-ink mb-3">Check your inbox</h1>
              <p className="text-sm text-ink-muted font-sans leading-relaxed mb-6">
                If <span className="font-semibold text-ink">{email}</span> is registered with us,
                you'll receive a password reset link shortly. Check your spam folder if it doesn't arrive.
              </p>
              <Link to="/login" className="btn-primary text-sm">
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-serif font-bold text-ink mb-2">Forgot your password?</h1>
              <p className="text-sm text-ink-muted font-sans mb-8">
                No problem — enter your email and we'll send a reset link.
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
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-2 border-gray-200 pl-10 pr-4 py-3 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors"
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-3.5 text-sm disabled:opacity-70"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
