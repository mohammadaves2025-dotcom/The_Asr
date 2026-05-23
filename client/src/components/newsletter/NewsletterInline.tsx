import { useState } from 'react';
import { Mail, ArrowRight, CircleCheck as CheckCircle } from 'lucide-react';
import { newsletterService } from '../../services/articles';

interface Props {
  variant?: 'default' | 'footer' | 'sidebar';
}

export default function NewsletterInline({ variant = 'default' }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
    try {
      await newsletterService.subscribe(email, undefined, 'footer');
      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (variant === 'footer') {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-serif font-bold text-brand-navy">The Maktoob Dispatch</h3>
          <p className="text-sm text-brand-navy/70 mt-1 font-sans">
            Weekly digest of rights, accountability &amp; ground reports. Free, always.
          </p>
        </div>
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-brand-navy font-semibold text-sm">
            <CheckCircle size={18} />
            Confirm your email to complete subscription
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0 w-full sm:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 sm:w-64 px-4 py-3 text-sm font-sans text-ink placeholder:text-ink-muted border-2 border-brand-navy outline-none focus:border-brand-navy-dark bg-white"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-brand-navy text-brand-yellow px-5 py-3 text-xs font-bold font-sans uppercase tracking-widest flex items-center gap-2 hover:bg-brand-navy-dark transition-colors disabled:opacity-70"
            >
              {status === 'loading' ? 'Subscribing...' : <><span>Subscribe</span> <ArrowRight size={14} /></>}
            </button>
          </form>
        )}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className="bg-brand-navy p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={16} className="text-brand-yellow" />
          <span className="text-xs font-bold font-sans uppercase tracking-widest text-brand-yellow">Newsletter</span>
        </div>
        <h3 className="text-base font-serif font-bold text-white mb-2">The Maktoob Dispatch</h3>
        <p className="text-xs text-white/60 mb-4 font-sans leading-relaxed">
          Weekly rights &amp; accountability digest. Free, always.
        </p>
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-brand-yellow text-xs font-semibold">
            <CheckCircle size={14} /> Check your email to confirm
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-3 py-2.5 text-sm font-sans text-ink placeholder:text-ink-muted outline-none bg-white"
              required
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-brand-yellow text-brand-navy py-2.5 text-xs font-bold font-sans uppercase tracking-widest hover:bg-brand-yellow-dark transition-colors disabled:opacity-70"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
            </button>
            {status === 'error' && <p className="text-xs text-red-300">{error}</p>}
          </form>
        )}
      </div>
    );
  }

  // Default
  return (
    <div className="bg-surface-secondary border border-gray-200 p-8 text-center">
      <Mail size={32} className="mx-auto text-brand-navy mb-4" />
      <h3 className="text-2xl font-serif font-bold text-ink mb-2">The Maktoob Dispatch</h3>
      <p className="text-sm text-ink-secondary mb-6 max-w-md mx-auto">
        Our weekly digest of the most important human rights and accountability stories. Free, forever.
      </p>
      {status === 'success' ? (
        <div className="flex items-center justify-center gap-2 text-status-success font-semibold">
          <CheckCircle size={18} /> Please check your email to confirm your subscription
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 text-sm font-sans border-2 border-gray-200 outline-none focus:border-brand-navy transition-colors"
            required
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="btn-primary whitespace-nowrap"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-xs text-status-error mt-2">{error}</p>}
    </div>
  );
}
