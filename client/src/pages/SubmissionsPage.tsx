import { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const TYPES = [
  { value: 'tip', label: 'News Tip', desc: 'Share information you think we should investigate' },
  { value: 'community-voice', label: 'Community Voice', desc: 'Your first-hand account or community story' },
  { value: 'letter-to-editor', label: 'Letter to the Editor', desc: 'Respond to our coverage' },
  { value: 'youth-writer', label: 'Youth Writer Application', desc: 'Apply to our young journalist program' },
  { value: 'correction', label: 'Correction Request', desc: 'Flag an error in our reporting' },
];

export default function SubmissionsPage() {
  const [type, setType] = useState('tip');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', body: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      await api.post('/submissions', { ...form, type });
      setStatus('success');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to submit. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="container-site max-w-2xl py-24 text-center">
        <CheckCircle size={48} className="text-accent-green mx-auto mb-4" />
        <h2 className="text-3xl font-serif font-bold text-ink mb-3">Thank you!</h2>
        <p className="text-ink-muted font-sans mb-6">Your submission has been received. Our team will review it and be in touch if we follow up.</p>
        <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', subject: '', body: '' }); }}
          className="btn-secondary">Submit another</button>
      </div>
    );
  }

  return (
    <div className="container-site max-w-3xl py-12">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[3px] text-ink-muted mb-2">Write to us</p>
        <h1 className="text-4xl font-serif font-bold text-ink mb-3">Reach Out</h1>
        <p className="text-ink-muted font-sans leading-relaxed">
          Have a tip, story idea, or want to contribute? Use the form below. All tips are kept strictly confidential.
        </p>
      </div>

      {/* Type selector */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {TYPES.map(t => (
          <button key={t.value} onClick={() => setType(t.value)}
            className={`p-4 border-2 text-left transition-all ${type === t.value ? 'border-brand-navy bg-brand-navy text-white' : 'border-gray-200 hover:border-brand-navy'}`}>
            <p className={`font-bold text-sm mb-1 ${type === t.value ? 'text-brand-yellow' : 'text-ink'}`}>{t.label}</p>
            <p className={`text-xs font-sans ${type === t.value ? 'text-white/60' : 'text-ink-muted'}`}>{t.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Your Name *</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Full name" />
          </div>
          <div>
            <label className="form-label">Email Address *</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder="your@email.com" />
          </div>
        </div>
        <div>
          <label className="form-label">Subject *</label>
          <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" placeholder="Brief subject line" />
        </div>
        <div>
          <label className="form-label">Your message *</label>
          <textarea rows={8} required value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="input-field resize-y" placeholder="Share the details…" />
        </div>

        <div className="bg-surface-secondary border border-gray-200 p-4 text-sm text-ink-muted font-sans">
          <p className="font-semibold text-ink mb-1">Confidentiality notice</p>
          All tips and submissions are treated with strict confidentiality. We will never reveal your identity without your explicit consent. For extra security, use Signal or our SecureDrop link.
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-sans">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <button type="submit" disabled={status === 'loading'} className="btn-primary gap-2 disabled:opacity-70">
          <Send size={15} /> {status === 'loading' ? 'Sending…' : 'Send Submission'}
        </button>
      </form>
    </div>
  );
}
