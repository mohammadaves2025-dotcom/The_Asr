import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { newsletterService } from '../services/articles';

export default function NewsletterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      await newsletterService.subscribe(email, name, 'newsletter-page');
      setStatus('success');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow mb-6">
          <Mail size={28} className="text-brand-navy" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[4px] text-brand-yellow mb-3">Free · No Spam · Weekly</p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight">
          The Orbis Journal Dispatch
        </h1>
        <p className="text-white/60 text-base font-sans leading-relaxed mb-10 max-w-md mx-auto">
          Every week, the most important stories on human rights, minorities, and accountability — curated by our editors. Free, always.
        </p>

        {status === 'success' ? (
          <div className="bg-brand-yellow/10 border border-brand-yellow/30 p-8">
            <CheckCircle size={32} className="text-brand-yellow mx-auto mb-3" />
            <h2 className="text-xl font-serif font-bold text-white mb-2">Check your inbox!</h2>
            <p className="text-white/60 text-sm font-sans">
              We've sent a confirmation email to <strong className="text-white">{email}</strong>. Click the link to activate your subscription.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-4 py-3.5 text-sm font-sans outline-none focus:border-brand-yellow transition-colors" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-4 py-3.5 text-sm font-sans outline-none focus:border-brand-yellow transition-colors"
              required />
            {error && <p className="text-red-400 text-sm font-sans text-left">{error}</p>}
            <button type="submit" disabled={status === 'loading'}
              className="w-full bg-brand-yellow text-brand-navy font-bold text-sm uppercase tracking-widest py-4 hover:bg-brand-yellow-dark transition-colors disabled:opacity-70">
              {status === 'loading' ? 'Subscribing…' : 'Subscribe Free →'}
            </button>
            <p className="text-white/20 text-xs font-sans">15,000+ readers. Unsubscribe anytime.</p>
          </form>
        )}
      </div>
    </div>
  );
}
