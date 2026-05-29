import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.85] text-ink-secondary font-sans">{children}</div>
    </section>
  );
}

export default function CorrectionsPage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="text-brand-yellow" />
            <h1 className="text-3xl font-serif font-bold text-white">Corrections Policy</h1>
          </div>
          <p className="text-white/50 text-sm font-sans mt-2">How we acknowledge errors and set the record straight.</p>
          <p className="text-white/30 text-xs font-sans mt-1">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-14 max-w-3xl">

        <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-10 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[14px] text-amber-900 font-sans leading-relaxed">
            Found an error in our reporting? Email <strong>corrections@theasr.in</strong> with the article link,
            the error, and supporting evidence. We respond within two working days.
          </p>
        </div>

        <PolicySection title="Our commitment to accuracy">
          <p>
            Getting facts right is the foundation of credible journalism. When The Asr makes an error — whether
            a wrong date, a misquoted figure, an inaccurate characterisation, or a more serious factual mistake — we
            correct it promptly and transparently. We do not quietly alter articles without noting the change.
          </p>
        </PolicySection>

        <PolicySection title="How corrections work">
          <p>
            <strong className="text-ink">Minor factual errors</strong> (spelling of a name, incorrect date, wrong title)
            are corrected in the article text and a correction note is appended at the top of the article stating
            what was changed and when.
          </p>
          <p>
            <strong className="text-ink">Significant factual errors</strong> (incorrect statistics, misattributed quotes,
            errors that substantially change the meaning of a story) receive a prominently placed correction notice
            at the top of the article, an editor's note in our newsletter if the story was widely distributed, and
            a post on our social media channels.
          </p>
          <p>
            <strong className="text-ink">Retractions</strong> are issued when a story cannot be substantially corrected
            because the core finding was wrong or cannot be supported. Retracted articles remain accessible with a
            prominent retraction notice explaining why they were retracted. We do not delete published content.
          </p>
        </PolicySection>

        <PolicySection title="Reporting an error">
          <p>
            Readers, sources, and subjects of our reporting may flag errors by emailing <strong className="text-ink">corrections@theasr.in</strong>.
            Please include: the URL of the article, the specific claim you believe is incorrect, and, if possible,
            a source or evidence supporting the correction.
          </p>
          <p>
            We will acknowledge receipt of your correction request within two working days and, if we determine
            a correction is warranted, publish it within five working days. If we disagree that an error occurred,
            we will explain our reasoning.
          </p>
          <p>
            If you are unsatisfied with our response to a corrections request, you may escalate to our Grievance
            Officer through the <Link to="/grievance" className="text-brand-red hover:underline">Grievance Redressal</Link> process.
          </p>
        </PolicySection>

        <PolicySection title="What we do not consider errors">
          <p>
            Corrections are for factual inaccuracies, not for disagreements with our editorial judgement, the framing
            of a story, or the prominence we gave to a story. We welcome letters and responses to our journalism, which
            may be submitted for publication to letters@theasr.in.
          </p>
        </PolicySection>

        <div className="mt-10 pt-8 border-t border-gray-200 flex gap-4">
          <Link to="/contact" className="btn-primary">Contact the Editors <ArrowLeft size={13} className="rotate-180" /></Link>
          <Link to="/editorial-policy" className="btn-secondary">Editorial Policy</Link>
        </div>
      </div>
    </div>
  );
}
