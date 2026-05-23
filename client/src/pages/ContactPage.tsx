import { useState } from 'react';
import { Mail, MapPin, Phone, Lock, Send, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      await api.post('/submissions', { ...form, type: 'contact' });
      setStatus('success');
    } catch {
      setError('Failed to send message. Please email us directly.');
      setStatus('error');
    }
  };

  return (
    <div className="container-site max-w-5xl py-12 md:py-16">
      <div className="mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[3px] text-ink-muted mb-2">Get in touch</p>
        <h1 className="text-4xl font-serif font-bold text-ink">Contact Us</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Info */}
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-ink text-sm uppercase tracking-widest mb-4">Editorial</h3>
            <div className="space-y-3">
              {[
                { icon: <Mail size={14} />, label: 'General', val: 'hello@theasr.com' },
                { icon: <Mail size={14} />, label: 'Tips & Tips', val: 'tips@theasr.com' },
                { icon: <Mail size={14} />, label: 'Editor', val: 'editor@theasr.com' },
                { icon: <Lock size={14} />, label: 'Secure (Signal)', val: '+91 98765 43210' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-ink-muted mt-0.5 flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{item.label}</p>
                    <p className="text-sm text-ink font-sans">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-ink text-sm uppercase tracking-widest mb-4">Office</h3>
            <div className="flex items-start gap-3 text-sm text-ink-muted font-sans">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              <p>The Asr Media,<br />New Delhi – 110001, India</p>
            </div>
          </div>
          <div className="bg-brand-navy text-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-2">Confidential Tips</p>
            <p className="text-sm text-white/60 font-sans leading-relaxed">
              All tips are treated with strict confidentiality. For sensitive leaks, use Signal or our SecureDrop. We never reveal sources.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {status === 'success' ? (
            <div className="text-center py-16">
              <CheckCircle size={40} className="text-accent-green mx-auto mb-4" />
              <h2 className="text-2xl font-serif font-bold text-ink mb-2">Message sent!</h2>
              <p className="text-ink-muted font-sans">We'll get back to you within 2 working days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label className="form-label">Subject *</label>
                <input type="text" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="form-label">Message *</label>
                <textarea rows={7} required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input-field resize-y" />
              </div>
              {error && <p className="text-red-600 text-sm font-sans">{error}</p>}
              <button type="submit" disabled={status === 'loading'} className="btn-primary gap-2 disabled:opacity-70">
                <Send size={15} /> {status === 'loading' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
