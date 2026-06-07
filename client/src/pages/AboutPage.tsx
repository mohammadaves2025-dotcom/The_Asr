import { Link } from 'react-router-dom';
import { Shield, Eye, Users, FileText } from 'lucide-react';

const VALUES = [
  { icon: <Shield size={22} />, title: 'Independence', desc: 'We take no money from political parties, governments, or corporations. Every rupee comes from readers.' },
  { icon: <Eye size={22} />, title: 'Accountability', desc: 'We hold the powerful to account — whether politicians, police, or institutions — without fear or favour.' },
  { icon: <Users size={22} />, title: 'Community-first', desc: 'We centre the voices and experiences of minorities, marginalised groups, and those excluded from mainstream coverage.' },
  { icon: <FileText size={22} />, title: 'Accuracy', desc: 'Every claim is verified, every source is protected, and every correction is published prominently.' },
];

// ── REPLACE THIS ARRAY WITH YOUR REAL TEAM ───────────────────────────────────
// Each member needs: name (string), role (string), bio (string)
// The initial letter of `name` is used as the avatar placeholder.
const TEAM = [
  {
    name: 'Your Name Here',
    role: 'Editor-in-Chief',
    bio: 'Add a short bio — 1–2 sentences about background and beat.',
  },
  {
    name: 'Your Name Here',
    role: 'Senior Reporter',
    bio: 'Add a short bio — 1–2 sentences about background and beat.',
  },
  {
    name: 'Your Name Here',
    role: 'Reporter',
    bio: 'Add a short bio — 1–2 sentences about background and beat.',
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-brand-navy py-20 md:py-28">
        <div className="container-site max-w-4xl">
          <p className="text-[10px] font-bold uppercase tracking-[4px] text-brand-yellow mb-4">About The Orbis Journal</p>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white leading-tight mb-6">
            Journalism that centres<br />those at the margins.
          </h1>
          <p className="text-white/60 text-lg font-sans leading-relaxed max-w-2xl">
            The Orbis Journal (In Greek, it translates to "around the world" or "worldly", implying a global or universal nature.) was founded on the belief that independent journalism is a public good — and that stories about minority communities, human rights violations, and social justice deserve the same rigour and prominence as mainstream political news.
          </p>
        </div>
      </div>

      {/* Mission */}
      <div className="container-site max-w-4xl py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[3px] text-ink-muted mb-3">Our Mission</p>
            <h2 className="text-3xl font-serif font-bold text-ink mb-5">We exist to report what others won't.</h2>
            <p className="text-ink-secondary font-sans leading-relaxed mb-4">
              India's mainstream media has largely abandoned marginalised communities. Muslim minorities, Dalits, Adivasis, LGBTQIA+ people, and religious minorities rarely see their stories told with accuracy, empathy, or urgency.
            </p>
            <p className="text-ink-secondary font-sans leading-relaxed mb-6">
              The Orbis Journal fills that gap — not with advocacy, but with rigorous, fact-based journalism that gives voice to those who have been systematically silenced.
            </p>
            <Link to="/support" className="btn-primary">Support Our Mission</Link>
          </div>
          <div className="bg-brand-navy p-8 text-white">
            <div className="grid grid-cols-2 gap-6">
              {[
                { n: '247+', label: 'Stories Published' },
                { n: '48K',  label: 'Monthly Readers' },
                { n: '15K+', label: 'Newsletter Subscribers' },
                { n: '4',    label: 'Years of Reporting' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-4xl font-serif font-black text-brand-yellow">{n}</p>
                  <p className="text-white/50 text-sm font-sans mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-surface-secondary py-14 md:py-20">
        <div className="container-site max-w-4xl">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-ink-muted mb-3 text-center">What We Stand For</p>
          <h2 className="text-3xl font-serif font-bold text-ink mb-10 text-center">Our editorial values</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white p-6 border border-gray-100">
                <div className="w-10 h-10 bg-brand-yellow flex items-center justify-center text-brand-navy mb-4">
                  {v.icon}
                </div>
                <h3 className="font-serif font-bold text-lg text-ink mb-2">{v.title}</h3>
                <p className="text-ink-muted text-sm font-sans leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="container-site max-w-4xl py-14 md:py-20">
        <p className="text-[10px] font-bold uppercase tracking-[3px] text-ink-muted mb-3">The People Behind The Orbis Journal</p>
        <h2 className="text-3xl font-serif font-bold text-ink mb-10">Our team</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map(member => (
            <div key={member.name} className="border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center mb-3">
                <span className="text-brand-yellow text-xl font-serif font-black">{member.name[0]}</span>
              </div>
              <h3 className="font-serif font-bold text-base text-ink">{member.name}</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-navy mb-2">{member.role}</p>
              <p className="text-xs text-ink-muted font-sans leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Policies */}
      <div className="bg-brand-navy text-white py-14">
        <div className="container-site max-w-4xl">
          <h2 className="text-2xl font-serif font-bold text-white mb-6">Transparency & policies</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Editorial Policy',    href: '/editorial-policy' },
              { label: 'Funding Transparency', href: '/funding' },
              { label: 'Corrections Policy',  href: '/corrections' },
              { label: 'Grievance Redressal', href: '/grievance' },
            ].map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="block p-4 border border-white/20 text-white/70 hover:text-white hover:border-brand-yellow text-sm font-bold font-sans transition-all"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}