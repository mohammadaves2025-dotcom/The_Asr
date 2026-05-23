import { Link } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';
import Logo from '../common/Logo';
import NewsletterInline from '../newsletter/NewsletterInline';

const FOOTER_LINKS = {
  'About': [
    { label: 'About Maktoob', href: '/about' },
    { label: 'Our Team', href: '/team' },
    { label: 'Editorial Policy', href: '/editorial-policy' },
    { label: 'Fact-Checking Policy', href: '/fact-checking' },
    { label: 'Corrections Policy', href: '/corrections' },
  ],
  'Content': [
    { label: 'Latest News', href: '/' },
    { label: 'Investigations', href: '/category/investigations' },
    { label: 'Ground Reports', href: '/category/ground-reports' },
    { label: 'Opinion & Analysis', href: '/category/opinion-analysis' },
    { label: 'All Categories', href: '/categories' },
  ],
  'Engage': [
    { label: 'Submit a Tip', href: '/submit?type=tip' },
    { label: 'Community Voice', href: '/submit?type=community-voice' },
    { label: 'Letter to Editor', href: '/submit?type=letter-to-editor' },
    { label: 'Youth Writer Program', href: '/submit?type=youth-writer' },
    { label: 'Support Us', href: '/support' },
  ],
  'Legal': [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Contact', href: '/contact' },
  ],
};

const SOCIALS = [
  { Icon: ExternalLink, href: 'https://twitter.com/maktoobmedia', label: 'Twitter' },
  { Icon: ExternalLink, href: 'https://instagram.com/maktoobmedia', label: 'Instagram' },
  { Icon: ExternalLink, href: 'https://facebook.com/maktoobmedia', label: 'Facebook' },
  { Icon: ExternalLink, href: 'https://youtube.com/maktoobmedia', label: 'YouTube' },
  { Icon: Mail, href: 'mailto:contact@maktoob.com', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      {/* Newsletter band */}
      <div className="bg-brand-yellow">
        <div className="container-site py-8">
          <NewsletterInline variant="footer" />
        </div>
      </div>

      {/* Main footer */}
      <div className="container-site py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Logo variant="light" size="md" />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Independent journalism covering human rights, minorities, and accountability across India.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center border border-white/20 text-white/60 hover:border-brand-yellow hover:text-brand-yellow transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-bold font-sans uppercase tracking-widest text-brand-yellow mb-4">
                {heading}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      to={href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-site py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Maktoob Media. All Rights Reserved.
          </p>
          <p className="text-xs text-white/40">
            Independent. Rights. Accountability.
          </p>
        </div>
      </div>
    </footer>
  );
}
