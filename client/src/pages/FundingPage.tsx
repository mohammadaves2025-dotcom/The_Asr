import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign } from 'lucide-react';

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.85] text-ink-secondary font-sans">{children}</div>
    </section>
  );
}

const FUNDERS = [
  { category: 'Reader Donations', share: 55, desc: 'One-time and recurring contributions from individual readers across India and the diaspora.' },
  { category: 'Journalism Grants', share: 30, desc: 'Project-specific grants from independent foundations focused on press freedom and human rights reporting.' },
  { category: 'Subscriptions', share: 15, desc: 'Premium reader subscriptions that support exclusive long-form investigations.' },
];

export default function FundingPage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <div className="flex items-center gap-3">
            <DollarSign size={22} className="text-brand-yellow" />
            <h1 className="text-3xl font-serif font-bold text-white">Funding & Transparency</h1>
          </div>
          <p className="text-white/50 text-sm font-sans mt-2">Where our money comes from, and how it is spent.</p>
          <p className="text-white/30 text-xs font-sans mt-1">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-14 max-w-3xl">

        <PolicySection title="Why we publish this">
          <p>
            Trust in journalism depends on knowing who pays for it. The Orbis Journal publishes this funding disclosure because
            readers deserve to know what interests — if any — might influence our editorial decisions. We believe
            financial transparency is inseparable from editorial credibility.
          </p>
          <p>
            Our editorial decisions are made solely by our journalists and editors. No funder, donor, or supporter
            may direct, veto, or influence our coverage. Any entity that attempts to do so will be publicly disclosed
            and their funding returned.
          </p>
        </PolicySection>

        <PolicySection title="Our funding model">
          <p>
            The Orbis Journal is funded entirely by readers and independent foundations. We do not carry advertising. We do not
            accept money from governments, political parties, or corporations with a stake in the subjects we cover.
          </p>
          <p>
            We have made a deliberate choice not to pursue government grants — including from national bodies that
            fund journalism — because we believe editorial independence requires financial independence from the state.
          </p>
        </PolicySection>

        {/* Funding breakdown */}
        <section className="mb-10">
          <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">Revenue breakdown (FY 2024–25)</h2>
          <div className="space-y-5 mt-5">
            {FUNDERS.map(({ category, share, desc }) => (
              <div key={category}>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-[14px] font-semibold text-ink font-sans">{category}</span>
                  <span className="text-[13px] font-black text-brand-red font-sans">{share}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full mb-2">
                  <div className="h-full bg-brand-navy rounded-full" style={{ width: `${share}%` }} />
                </div>
                <p className="text-[13px] text-ink-muted font-sans leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <PolicySection title="Grants and foundations">
          <p>
            We accept project-specific grants from independent foundations whose focus areas align with our journalism —
            press freedom, human rights documentation, and investigative reporting in the public interest. All grants
            are disclosed here. Foundation funders do not have editorial input, advance access to stories, or any role
            in our reporting.
          </p>
          <p>
            <strong className="text-ink">Current grant funders:</strong> This section will be updated when active
            grant funding is in place. We commit to disclosing all funders providing more than ₹1,00,000 in a
            financial year by name and purpose within 60 days of receipt.
          </p>
        </PolicySection>

        <PolicySection title="What we will never accept">
          <p>We maintain a clear list of funding we refuse regardless of the amount or conditions offered:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Advertising or sponsored content of any kind</li>
            <li>Funding from political parties or candidates</li>
            <li>Funding from government ministries, departments, or state-owned entities</li>
            <li>Funding from corporations that are subjects of our ongoing coverage</li>
            <li>Funding conditioned on editorial access, advance notice, or story suppression</li>
          </ul>
        </PolicySection>

        <PolicySection title="How funds are spent">
          <p>
            Reader support goes directly to journalism. The largest portions of our budget are journalist salaries
            and field reporting costs — travel, documentation, and source protection tools for reporters working in
            sensitive areas. A smaller portion covers technology (this website, our newsletter platform, and secure
            communication tools) and operations.
          </p>
          <p>
            We do not pay executive salaries that exceed three times the salary of our most junior full-time journalist.
          </p>
        </PolicySection>

        <PolicySection title="Annual reports">
          <p>
            We publish an annual report each year covering our editorial output, financial summary, and impact.
            If you have questions about our funding that are not answered here, please write to
            <strong className="text-ink"> theorbisjournal@gmail.com</strong>.
          </p>
        </PolicySection>

        <div className="mt-10 pt-8 border-t border-gray-200 flex gap-4">
          <Link to="/support" className="btn-primary">Support Our Work <ArrowLeft size={13} className="rotate-180" /></Link>
          <Link to="/contact" className="btn-secondary">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
