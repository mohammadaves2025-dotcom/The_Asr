import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react'; // Kept Send, removed brands
import { FaTwitter, FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa'; // Added brands
import { newsletterService } from '../../services/articles';

const NAV_SECTIONS = [
  {
    title: 'Sections',
    links: [
      { label: 'Human Rights', href: '/category/human-rights' },
      { label: 'Minorities', href: '/category/minorities' },
      { label: 'Politics', href: '/category/politics' },
      { label: 'Gender & Rights', href: '/category/gender' },
      { label: 'Law & Courts', href: '/category/law-courts' },
      { label: 'Ground Reports', href: '/category/ground-reports' },
      { label: 'International', href: '/category/international' },
      { label: 'Opinion', href: '/category/opinion' },
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
      { label: 'Contact', href: '/contact' },
      { label: 'Write For Us', href: '/submissions' },
    ],
  },
];

// Updated to use react-icons
const SOCIAL = [
  { icon: <FaTwitter size={15} />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <FaInstagram size={15} />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <FaYoutube size={15} />, href: 'https://youtube.com', label: 'YouTube' },
  { icon: <FaFacebook size={15} />, href: 'https://facebook.com', label: 'Facebook' },
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
      <div className="border-b border-white/10 bg-brand-yellow/5">
        <div className="container-site py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
            <div className="flex-1 max-w-lg">
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-2">Free Newsletter</p>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-white leading-snug mb-3">
                The Asr Dispatch — stories that matter.
              </h3>
              <p className="text-white/50 text-sm font-sans leading-relaxed">
                Our weekly digest of the most important human rights and accountability stories from India and beyond. Free, always.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              {status === 'success' ? (
                <div className="flex items-center gap-3 bg-brand-yellow/10 border border-brand-yellow/30 p-4">
                  <Send size={16} className="text-brand-yellow" />
                  <p className="text-white text-sm font-sans">
                    <span className="font-bold">Subscribed!</span> Check your email to confirm.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-4 py-3 text-sm font-sans outline-none focus:border-brand-yellow transition-colors"
                    required
                  />
                  <button type="submit" disabled={status === 'loading'}
                    className="bg-brand-yellow text-brand-navy font-bold text-xs uppercase tracking-widest px-6 py-3 hover:bg-brand-yellow-dark transition-colors disabled:opacity-70 whitespace-nowrap">
                    {status === 'loading' ? '…' : 'Subscribe'}
                  </button>
                </form>
              )}
              <p className="text-white/20 text-xs font-sans mt-2">No spam. Unsubscribe anytime. 15,000+ readers.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="container-site py-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-end gap-0.5 mb-4">
            <span className="text-2xl font-serif font-black text-white hover:text-white/80 transition-colors">The Asr</span>
            <span className="text-2xl font-serif font-black text-brand-yellow">.</span>
          </Link>
          <p className="text-sm text-white/50 font-sans leading-relaxed mb-5">
            Independent journalism covering human rights, minorities, and social justice in India.
          </p>
          <div className="flex items-center gap-2 mb-6">
            {SOCIAL.map(({ icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/50 hover:text-white hover:border-white/60 transition-all">
                {icon}
              </a>
            ))}
          </div>
          <Link to="/support"
            className="inline-flex bg-brand-yellow text-brand-navy text-xs font-black uppercase tracking-widest px-4 py-2.5 hover:bg-brand-yellow-dark transition-colors">
            Support Our Work ↗
          </Link>
        </div>

        {/* Nav columns */}
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-[3px] text-white/30 mb-4">{section.title}</h4>
            <ul className="space-y-2.5">
              {section.links.map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/55 hover:text-white transition-colors font-sans">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/20 text-xs font-sans">
          © {new Date().getFullYear()} The Asr. Reader-funded, independently owned.
        </p>
        <div className="flex items-center gap-5">
          {[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Corrections', href: '/corrections' },
          ].map(link => (
            <Link key={link.href} to={link.href}
              className="text-white/20 hover:text-white/60 text-xs font-sans transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}