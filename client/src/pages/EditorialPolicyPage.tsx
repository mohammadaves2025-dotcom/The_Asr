import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.85] text-ink-secondary font-sans">{children}</div>
    </section>
  );
}

export default function EditorialPolicyPage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen size={22} className="text-brand-yellow" />
            <h1 className="text-3xl font-serif font-bold text-white">Editorial Policy</h1>
          </div>
          <p className="text-white/50 text-sm font-sans mt-2">Our standards for sourcing, verification, fairness, and editorial independence.</p>
          <p className="text-white/30 text-xs font-sans mt-1">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-14 max-w-3xl">

        <PolicySection title="Our editorial mission">
          <p>
            The Orbis Journal publishes original journalism on human rights, minority communities, social justice, and accountability.
            Our editorial decisions are guided solely by the public interest and the experiences of communities that are
            systematically underreported or misrepresented in mainstream media.
          </p>
          <p>
            We are committed to factual, fair, and independent journalism. Our reporting is never shaped by the preferences
            of funders, advertisers, or any government. No person or organisation that provides financial support to The Orbis Journal
            may influence editorial decisions — this is non-negotiable.
          </p>
        </PolicySection>

        <PolicySection title="Accuracy and verification">
          <p>
            Every factual claim in a published article must be independently verified before publication. This means at
            least one primary source (a document, official record, or direct statement) or two credible independent secondary
            sources. Where facts cannot be verified to our satisfaction, we do not publish them.
          </p>
          <p>
            Data, statistics, and figures must be attributed to their original source. When we quote official data, we
            link to or name the original dataset. When official figures conflict with ground-level accounts, we report
            both and note the discrepancy clearly.
          </p>
          
        </PolicySection>

        <PolicySection title="Fairness and right of reply">
          <p>
            Before publishing serious allegations against any individual, organisation, or institution, we will contact the
            subject and give them a reasonable opportunity to respond — typically 48 hours for daily news, longer for
            investigations. Their response will be published in the same article. If they decline to respond, we will note this.
          </p>
          <p>
            We do not publish rumour, unverified social media content, or speculation as fact. We clearly label opinion
            and analysis pieces so readers can distinguish them from news reporting.
          </p>
        </PolicySection>

        <PolicySection title="Sources and confidentiality">
          <p>
            We protect the identity of confidential sources. When a source requests anonymity, we assess whether the
            public interest served by the information outweighs the risk of harm, and whether the source has first-hand
            knowledge. We do not grant anonymity lightly.
          </p>
          <p>
            We do not pay sources for information. We do accept documents, data, and eyewitness testimony. We verify
            independently rather than relying solely on anonymous tips.
          </p>
        </PolicySection>

        <PolicySection title="Conflicts of interest">
          <p>
            Journalists at The Orbis Journal must disclose any personal, financial, or political relationship with a story they are
            covering. Where a conflict exists, the journalist will be reassigned. Staff may not cover organisations they
            have previously worked for within the past two years.
          </p>
          <p>
            The newsroom does not accept gifts, paid travel, or hospitality from sources, government bodies, or companies
            we cover. Press trips may be accepted only when independent travel is not feasible and editorial independence
            is not compromised.
          </p>
        </PolicySection>

        <PolicySection title="Diversity and representation">
          <p>
            We actively work to centre the voices of affected communities rather than speaking for them. Where possible,
            our reporters from within the communities they cover. We aim for geographic, religious, gender, and caste
            diversity in our sourcing — particularly in stories about marginalised groups.
          </p>
          <p>
            We do not use dehumanising language, slurs, or stereotypes in our reporting. Identity terms follow the
            preferences of the communities themselves.
          </p>
        </PolicySection>

        <PolicySection title="Corrections and updates">
          <p>
            When we make an error, we correct it promptly, transparently, and without minimising it. See our
            full <Link to="/corrections" className="text-brand-red hover:underline">Corrections Policy</Link> for
            how we handle errors and how to report one.
          </p>
        </PolicySection>

        <div className="mt-10 pt-8 border-t border-gray-200 flex gap-4">
          <Link to="/contact" className="btn-primary">Contact the Editors <ArrowLeft size={13} className="rotate-180" /></Link>
          <Link to="/corrections" className="btn-secondary">Corrections Policy</Link>
        </div>
      </div>
    </div>
  );
}
