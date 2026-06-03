import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Newsletter strip removed per client instructions
// Telegram removed; LinkedIn + WhatsApp Channel added
const SOCIAL = [
  { label: 'Twitter / X',     href: '#', short: 'X'  },
  { label: 'Instagram',       href: '#', short: 'IG' },
  { label: 'YouTube',         href: '#', short: 'YT' },
  { label: 'Facebook',        href: '#', short: 'FB' },
  { label: 'LinkedIn',        href: '#', short: 'LI' },
  { label: 'WhatsApp Channel', href: '#', short: 'WA' },
];

// Removed: Social Justice, Special Series, Verified Reports, Grievance,
//          Editorial Policy, Corrections, Funding, Our Team
const NAV_SECTIONS = [
  {
    title: 'Sections',
    links: [
      { label: 'Indian Muslim',   href: '/category/indian-muslim' },
      { label: 'Minorities',      href: '/category/minorities' },
      { label: 'Politics',        href: '/category/politics' },
      { label: 'Gender & Rights', href: '/category/gender' },
      { label: 'Law & Justice',   href: '/category/law-courts' },
      { label: 'Ground Reports',  href: '/category/ground-reports' },
      { label: 'Hindutva Watch',  href: '/category/hindutva-watch' },
      { label: 'International',   href: '/category/international' },
    ],
  },
  {
    title: 'Formats',
    links: [
      { label: 'Investigations',  href: '/category/investigation' },
      { label: 'Opinion',         href: '/category/opinion' },
      { label: 'In Their Words',  href: '/in-their-words' },
      { label: 'Explainers',      href: '/category/explainers' },
      { label: 'Videos',          href: '/category/videos' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Us',    href: '/about' },
      { label: 'Contact Us',  href: '/contact' },
      { label: 'Write For Us', href: '/submissions' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use',  href: '/terms' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white mt-16 md:mt-24">

      {/* ── Support CTA strip ── */}
      <div className="bg-brand-red/10 border-b border-white/5">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {/* Updated brand name */}
            <p className="font-serif font-bold text-white text-base">
              The Orbis Journal is 100% reader-funded.
            </p>
            {/* Updated transparency tagline per client */}
            <p className="text-white/40 text-[11px] font-sans mt-0.5">
              No Political Influence · No Corporate Backing · Just Fearless Journalism
            </p>
          </div>
          <Link
            to="/support"
            className="flex items-center gap-2 bg-brand-yellow text-brand-navy font-black text-[10px] uppercase tracking-[2px] px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors font-sans flex-shrink-0"
          >
            Support The Orbis Journal <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── Nav grid ── */}
      <div className="border-b border-white/10">
        <div className="container-site py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand col */}
          <div>
            <Link to="/" className="block mb-4 group">
              <span className="text-xl font-serif font-black text-white group-hover:text-brand-yellow transition-colors leading-tight">
                The Orbis Journal
              </span>
            </Link>
            <p className="text-white/30 text-[11px] font-sans leading-relaxed mb-5">
              Independent journalism on human rights, minorities, and social justice in India and
              beyond.
            </p>
            <div className="flex flex-wrap gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="border border-white/15 text-white/40 hover:text-white hover:border-white/40 text-[10px] font-bold px-2.5 py-1.5 rounded-md transition-all font-sans"
                >
                  {s.short}
                </a>
              ))}
            </div>
          </div>

          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[9px] font-black uppercase tracking-[3px] text-white/25 mb-4 font-sans">
                {section.title}
              </p>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-white/50 hover:text-white transition-colors text-[12px] font-sans"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/25 text-[10px] font-sans">
          © {new Date().getFullYear()} The Orbis Journal. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Use',   href: '/terms' },
            { label: 'Contact',        href: '/contact' },
          ].map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className="text-white/25 hover:text-white/60 text-[10px] font-sans transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}