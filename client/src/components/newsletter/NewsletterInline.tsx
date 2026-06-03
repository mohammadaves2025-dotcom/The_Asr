import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { newsletterService } from '../../services/articles';

interface Props {
  source?: string;
  variant?: 'default' | 'dark' | 'minimal';
}

export default function NewsletterInline({ source = 'inline', variant = 'dark' }: Props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await newsletterService.subscribe(email.trim(), name.trim() || undefined, source);
      setStatus('success');
      setEmail('');
      setName('');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
      setErrorMsg(msg);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={`p-6 rounded-2xl flex items-center gap-3 ${variant === 'dark' ? 'bg-brand-navy text-white' : 'bg-surface-secondary border border-gray-200'}`}>
        <CheckCircle size={20} className="text-brand-yellow flex-shrink-0" />
        <div>
          <p className="font-serif font-bold text-base">You're subscribed!</p>
          <p className={`text-[12px] mt-0.5 font-sans ${variant === 'dark' ? 'text-white/50' : 'text-ink-muted'}`}>
            Check your inbox for a welcome email.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 border border-gray-300 px-3 py-2.5 text-sm font-sans outline-none focus:border-brand-navy text-ink rounded-lg"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary py-2.5 px-4 disabled:opacity-60 rounded-lg"
        >
          <Send size={13} />
        </button>
      </form>
    );
  }

  // dark variant (used in article page and homepage sidebar)
  return (
    <div className={`p-6 rounded-2xl ${variant === 'dark' ? 'bg-brand-navy text-white' : 'bg-surface-secondary border border-gray-200'}`}>
      <p className={`text-[9px] font-black uppercase tracking-[3px] mb-2 font-sans ${variant === 'dark' ? 'text-brand-yellow' : 'text-ink-muted'}`}>
        Free Newsletter
      </p>
      <h3 className={`font-serif font-bold text-lg leading-snug mb-1.5 ${variant === 'dark' ? 'text-white' : 'text-ink'}`}>
        Stories like this in your inbox.
      </h3>
      <p className={`text-[11px] mb-4 font-sans leading-relaxed ${variant === 'dark' ? 'text-white/45' : 'text-ink-muted'}`}>
        Independent journalism on human rights. Free, weekly.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name (optional)"
          className={`border px-3 py-2.5 text-sm outline-none font-sans transition-colors rounded-lg ${
            variant === 'dark'
              ? 'bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-brand-yellow/50'
              : 'bg-white border-gray-300 text-ink placeholder:text-ink-muted focus:border-brand-navy'
          }`}
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className={`border px-3 py-2.5 text-sm outline-none font-sans transition-colors rounded-lg ${
            variant === 'dark'
              ? 'bg-white/8 border-white/15 text-white placeholder:text-white/25 focus:border-brand-yellow/50'
              : 'bg-white border-gray-300 text-ink placeholder:text-ink-muted focus:border-brand-navy'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex items-center justify-center gap-2 bg-brand-yellow text-brand-navy font-black text-[10px] uppercase tracking-[2px] py-2.5 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-60 font-sans"
        >
          {status === 'loading' ? 'Subscribing…' : <><Send size={12} /> Subscribe Free</>}
        </button>
        {status === 'error' && (
          <p className="text-red-400 text-[11px] font-sans">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}