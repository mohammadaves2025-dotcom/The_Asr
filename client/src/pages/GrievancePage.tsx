import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.85] text-ink-secondary font-sans">{children}</div>
    </section>
  );
}

const STEPS = [
  {
    step: '01',
    title: 'Submit your grievance',
    desc: 'Email theorbisjournal@gmail.com with the subject line "Grievance: [Article Title or Topic]". Include the article URL, a clear description of your complaint, and any supporting evidence.',
  },
  {
    step: '02',
    title: 'Acknowledgement',
    desc: 'Our Grievance Officer will acknowledge receipt of your complaint within three working days and assign it a reference number.',
  },
  {
    step: '03',
    title: 'Investigation',
    desc: 'The Grievance Officer will review the complaint with the relevant editor and, where appropriate, the journalist who produced the story. We may contact you for additional information.',
  },
  {
    step: '04',
    title: 'Decision',
    desc: 'We will issue a written decision within 14 working days of acknowledgement. If we uphold the complaint, we will set out the remedial action — correction, clarification, or apology — and a timeline.',
  },
  {
    step: '05',
    title: 'Appeal',
    desc: "If you are unsatisfied with our decision, you may request a review by our Editorial Board within 10 working days of the decision. The Editorial Board's decision is final.",
  },
];

export default function GrievancePage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <div className="flex items-center gap-3">
            <MessageCircle size={22} className="text-brand-yellow" />
            <h1 className="text-3xl font-serif font-bold text-white">Grievance Redressal</h1>
          </div>
          <p className="text-white/50 text-sm font-sans mt-2">A formal process for complaints about our coverage or conduct.</p>
          <p className="text-white/30 text-xs font-sans mt-1">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-14 max-w-3xl">

        <div className="bg-brand-navy/5 border border-brand-navy/20 px-5 py-5 mb-10">
          <p className="text-[11px] font-black uppercase tracking-[2px] text-brand-navy mb-1 font-sans">Grievance Officer</p>
          <p className="text-[15px] font-serif font-semibold text-ink mb-0.5">The Orbis Journal Editorial Desk</p>
          <p className="text-[13px] text-ink-muted font-sans">theorbisjournal@gmail.com · Response within 14 working days</p>
        </div>

        <PolicySection title="Purpose of this process">
          <p>
            The Orbis Journal is committed to accountable journalism. If you believe we have misrepresented facts, violated your
            privacy, published inaccurate information about you or your community, or otherwise failed to meet our
            editorial standards, you have the right to a formal review of your complaint.
          </p>
          <p>
            This process is available to subjects of our reporting, sources, readers, and any member of the public who
            believes they have been directly affected by content published on theorbisjournal@gmail.com. It is separate from our routine
            <Link to="/corrections" className="text-brand-red hover:underline mx-1">corrections process</Link> and is intended
            for more serious concerns.
          </p>
        </PolicySection>

        <PolicySection title="What you can complain about">
          <p>This process covers complaints including but not limited to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Factual inaccuracies that have not been corrected after you reported them through our corrections process</li>
            <li>Breach of privacy — publication of personal information without adequate justification</li>
            <li>Misrepresentation of your statements, identity, or position</li>
            <li>Failure to give you a fair right of reply before publishing serious allegations</li>
            <li>Discriminatory or dehumanising language in our coverage</li>
            <li>Conduct of our journalists that violated our editorial standards</li>
          </ul>
        </PolicySection>

        {/* Process steps */}
        <section className="mb-10">
          <h2 className="text-lg font-serif font-bold text-ink mb-5 pb-2 border-b border-gray-200">The process</h2>
          <div className="space-y-0">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex gap-5 relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gray-200" />
                )}
                <div className="flex-shrink-0 w-10 h-10 bg-brand-navy flex items-center justify-center rounded-full z-10">
                  <span className="text-[10px] font-black text-brand-yellow font-sans">{step}</span>
                </div>
                <div className="pb-8 flex-1">
                  <p className="text-[14px] font-bold text-ink font-sans mb-1">{title}</p>
                  <p className="text-[13px] text-ink-muted font-sans leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <PolicySection title="What this process does not cover">
          <p>
            This process is not intended for disagreements with our editorial judgement, the angle or framing of a story,
            or our decision to cover (or not cover) a particular topic. We take such feedback seriously as reader input,
            but it is not a grievance under this policy.
          </p>
          <p>
            If your complaint relates to a legal matter — defamation, copyright infringement, or a court order — please
            contact us at theorbisjournal@gmail.com. We recommend seeking independent legal advice before pursuing legal action.
          </p>
        </PolicySection>

        <PolicySection title="Mandatory disclosure under IT Rules 2021">
          <p>
            In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021,
            The Orbis Journal designates a Grievance Officer for digital content complaints. Complaints under the IT Rules may be
            submitted to theorbisjournal@gmail.com and will be addressed within the timelines prescribed under applicable law.
          </p>
        </PolicySection>

        <div className="mt-10 pt-8 border-t border-gray-200 flex gap-4">
          <a href="mailto:theorbisjournal@gmail.com" className="btn-primary">
            Submit a Grievance <ArrowLeft size={13} className="rotate-180" />
          </a>
          <Link to="/editorial-policy" className="btn-secondary">Editorial Policy</Link>
        </div>
      </div>
    </div>
  );
}