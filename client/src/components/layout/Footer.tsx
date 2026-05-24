import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ArrowRight } from 'lucide-react';
import { newsletterService } from '../../services/articles';

const NAV_SECTIONS = [
  {
    title: 'Sections',
    links: [
      { label: 'Human Rights', href: '/category/human-rights' },
      { label: 'Minorities & Communities', href: '/category/minorities' },
      { label: 'Politics & Governance', href: '/category/politics' },
      { label: 'Gender & Rights', href: '/category/gender' },
      { label: 'Law & Courts', href: '/category/law-courts' },
      { label: 'Ground Reports', href: '/category/ground-reports' },
      { label: 'Social Justice & Caste', href: '/category/social-justice' },
      { label: 'International', href: '/category/international' },
    ],
  },
  {
    title: 'Formats',
    links: [
      { label: 'Investigations', href: '/category/investigation' },
      { label: 'Explainers', href: '/category/explainer' },
      { label: 'In Their Words', href: '/in-their-words' },
      { label: '✓ Verified Reports', href: '/verified' },
      { label: 'Photo Essays', href: '/category/photo-essay' },
      { label: 'Opinion & Analysis', href: '/category/opinion' },
      { label: 'Special Series', href: '/series' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Editorial Policy', href: '/editorial-policy' },
      { label: 'Funding & Transparency', href: '/funding' },
      { label: 'Corrections', href: '/corrections' },
      { label: 'Grievance Redressal', href: '/grievance' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Write For Us', href: '/submissions' },
    ],
  },
];

const SOCIAL = [
  { label: 'Twitter / X', href: '#', short: 'X' },
  { label: 'Instagram', href: '#', short: 'IG' },
  { label: 'YouTube', href: '#', short: 'YT' },
  { label: 'Facebook', href: '#', short: 'FB' },
  { label: 'Telegram', href: '#', short: 'TG' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await newsletterService.subscribe(email.trim(), undefined, 'footer');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="bg-brand-navy text-white mt-16 md:mt-24">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="container-site py-10 md:py-14">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-yellow mb-3 font-sans">
                Free Newsletter
              </p>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight mb-3">
                Stories that matter, delivered weekly.
              </h3>
              <p className="text-white/40 text-[12px] font-sans leading-relaxed">
                Join 15,000+ readers getting independent journalism on human rights, minorities, and social justice.
                No spam. Unsubscribe anytime.
              </p>
            </div>
            <div>
              {status === 'success' ? (
                <div className="border border-brand-yellow/30 bg-brand-yellow/5 p-6 text-center">
                  <p className="text-brand-yellow font-serif font-bold text-lg mb-1">You're subscribed.</p>
                  <p className="text-white/50 text-[12px] font-sans">Check your inbox for a welcome email.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="flex-1 bg-white/8 border border-white/15 text-white placeholder:text-white/25 px-4 py-3 text-sm outline-none focus:border-brand-yellow/40 transition-colors font-sans"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex items-center justify-center gap-2 bg-brand-yellow text-brand-navy font-black text-[10px] uppercase tracking-[2px] px-6 py-3 hover:bg-yellow-400 transition-colors disabled:opacity-60 font-sans flex-shrink-0"
                  >
                    {status === 'loading' ? 'Subscribing…' : <><Send size={12} /> Subscribe Free</>}
                  </button>
                </form>
              )}
              {status === 'error' && (
                <p className="text-accent-red text-[11px] mt-2 font-sans">Something went wrong. Please try again.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Support CTA strip */}
      <div className="bg-brand-red/10 border-b border-white/5">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-serif font-bold text-white text-base">The Asr is 100% reader-funded.</p>
            <p className="text-white/40 text-[11px] font-sans mt-0.5">No ads. No corporate backing. Just fearless journalism.</p>
          </div>
          <Link to="/support"
            className="flex items-center gap-2 bg-brand-yellow text-brand-navy font-black text-[10px] uppercase tracking-[2px] px-6 py-3 hover:bg-yellow-400 transition-colors font-sans flex-shrink-0">
            Support The Asr <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Nav grid */}
      <div className="border-b border-white/10">
        <div className="container-site py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Masthead col */}
          <div>
            <Link to="/" className="block mb-4 group">
              <span className="text-2xl font-serif font-black text-white group-hover:text-brand-yellow transition-colors">The Asr</span>
              <span className="text-2xl font-serif font-black text-brand-red">.</span>
            </Link>
            <p className="text-white/30 text-[11px] font-sans leading-relaxed mb-5">
              Independent journalism on human rights, minorities, and social justice in India and beyond.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  className="border border-white/15 text-white/40 hover:text-white hover:border-white/40 text-[10px] font-bold px-2.5 py-1.5 transition-all font-sans">
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-[9px] font-black uppercase tracking-[3px] text-white/25 mb-4 font-sans">{section.title}</p>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href}
                      className="text-white/50 hover:text-white transition-colors text-[12px] font-sans">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/25 text-[10px] font-sans">
          © {new Date().getFullYear()} The Asr Media. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Use', href: '/terms' },
            { label: 'Corrections', href: '/corrections' },
          ].map(l => (
            <Link key={l.href} to={l.href}
              className="text-white/25 hover:text-white/60 text-[10px] font-sans transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
