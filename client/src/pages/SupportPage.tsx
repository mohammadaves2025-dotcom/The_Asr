import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Zap, Users } from 'lucide-react';

const AMOUNTS = ['₹200', '₹500', '₹1000', '₹2000', '₹5000'];

const WHY_ITEMS = [
  { icon: <Shield size={20} />, title: 'No corporate owners', desc: 'We answer only to our readers. No advertiser can tell us what not to cover.' },
  { icon: <Zap size={20} />, title: 'Ground-level reporting', desc: 'Our journalists travel to conflict zones and underreported communities.' },
  { icon: <Users size={20} />, title: 'Minority-first coverage', desc: 'Stories about communities that mainstream media ignores or distorts.' },
  { icon: <Heart size={20} />, title: 'Free for everyone', desc: 'All our journalism is free to read. No paywall, ever.' },
];

export default function SupportPage() {
  const [selected, setSelected] = useState('₹500');
  const [custom, setCustom] = useState('');
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once');

  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-navy text-white py-16 md:py-24">
        <div className="container-site max-w-4xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[4px] text-brand-yellow mb-4">Support Independent Journalism</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            The Asr is reader-funded.<br />Entirely.
          </h1>
          <p className="text-white/60 text-lg font-sans max-w-2xl mx-auto leading-relaxed">
            No ads. No corporate funding. No government grants. Every story we publish is made possible by readers like you who believe accountability journalism matters.
          </p>
        </div>
      </div>

      <div className="container-site max-w-5xl py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Donation card */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-ink mb-6">Choose your support</h2>

            {/* Frequency */}
            <div className="flex gap-2 mb-6">
              {(['once', 'monthly'] as const).map(f => (
                <button key={f} onClick={() => setFrequency(f)}
                  className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-widest border-2 transition-all ${frequency === f ? 'bg-brand-navy text-brand-yellow border-brand-navy' : 'border-gray-200 text-ink hover:border-brand-navy'}`}>
                  {f === 'once' ? 'One-time' : 'Monthly'}
                </button>
              ))}
            </div>

            {/* Amount grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => { setSelected(a); setCustom(''); }}
                  className={`py-3 text-sm font-bold border-2 transition-all ${selected === a && !custom ? 'bg-brand-navy text-brand-yellow border-brand-navy' : 'border-gray-200 text-ink hover:border-brand-navy'}`}>
                  {a}
                </button>
              ))}
              <input type="text" value={custom}
                onChange={e => { setCustom(e.target.value); setSelected(''); }}
                placeholder="Custom ₹"
                className="col-span-3 border-2 border-gray-200 px-4 py-3 text-sm font-sans text-ink outline-none focus:border-brand-navy transition-colors text-center"
              />
            </div>

            <button className="w-full btn-primary py-4 text-base justify-center mb-4">
              {frequency === 'monthly' ? 'Support Monthly' : 'Donate'} {custom || selected}
            </button>

            <p className="text-xs text-ink-muted font-sans text-center">
              Secure payment · UPI, Cards, NetBanking accepted · Receipts emailed
            </p>

            {/* UPI note */}
            <div className="mt-6 p-4 bg-surface-secondary border border-gray-200">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-1">Direct UPI</p>
              <p className="font-mono text-sm text-ink">theasr@upi</p>
            </div>
          </div>

          {/* Why support */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-ink mb-6">Why it matters</h2>
            <div className="space-y-5">
              {WHY_ITEMS.map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-brand-yellow flex items-center justify-center flex-shrink-0 text-brand-navy">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-ink text-sm">{item.title}</p>
                    <p className="text-sm text-ink-muted font-sans mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-brand-navy text-white">
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-3">Where your money goes</p>
              {[
                { label: 'Field reporting & travel', pct: 40 },
                { label: 'Journalist salaries', pct: 35 },
                { label: 'Technology & platform', pct: 15 },
                { label: 'Operations', pct: 10 },
              ].map(({ label, pct }) => (
                <div key={label} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/70">{label}</span>
                    <span className="text-brand-yellow font-bold">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full">
                    <div className="h-full bg-brand-yellow rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Other ways */}
        <div className="mt-14 pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-serif font-bold text-ink mb-6">Other ways to support</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Fund a Story', desc: 'Crowdfund specific investigations you want us to pursue.', cta: 'Browse stories' },
              { title: 'Gift a Subscription', desc: 'Support us in a friend\'s name. Great gift for someone who cares.', cta: 'Gift now' },
              { title: 'Sponsor a Reporter', desc: 'Support a young journalist from a marginalized community.', cta: 'Learn more' },
            ].map(item => (
              <div key={item.title} className="border-2 border-gray-200 p-5 hover:border-brand-navy transition-colors group">
                <h3 className="font-serif font-bold text-base text-ink mb-2 group-hover:text-brand-navy">{item.title}</h3>
                <p className="text-sm text-ink-muted font-sans mb-4 leading-relaxed">{item.desc}</p>
                <button className="text-xs font-bold uppercase tracking-widest text-brand-navy hover:underline">{item.cta} →</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
