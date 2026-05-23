import { Link } from 'react-router-dom';

export default function CorrectionsPage() {
  const title = 'CorrectionsPage'.replace('Page','').replace(/([A-Z])/g,' $1').trim();
  return (
    <div className="container-site max-w-3xl py-12 md:py-16">
      <nav className="flex items-center gap-2 text-xs text-ink-muted font-sans mb-6">
        <Link to="/" className="hover:text-brand-navy">Home</Link>
        <span>›</span>
        <span>{title}</span>
      </nav>
      <h1 className="text-4xl font-serif font-bold text-ink mb-8">{title}</h1>
      <div className="prose max-w-none text-ink-secondary font-sans leading-relaxed space-y-5">
        <p className="text-ink-muted italic text-sm">Last updated: January 2025</p>
        <p>This page is being updated. For immediate queries, please <Link to="/contact" className="text-brand-navy hover:underline">contact us</Link>.</p>
      </div>
    </div>
  );
}
