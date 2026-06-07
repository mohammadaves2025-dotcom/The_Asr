import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.85] text-ink-secondary font-sans">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <div className="flex items-center gap-3">
            <FileText size={22} className="text-brand-yellow" />
            <h1 className="text-3xl font-serif font-bold text-white">Terms of Use</h1>
          </div>
          <p className="text-white/50 text-sm font-sans mt-2">The terms governing your use of this website and its content.</p>
          <p className="text-white/30 text-xs font-sans mt-1">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-14 max-w-3xl">

        <PolicySection title="Acceptance of terms">
          <p>
            By accessing or using theasr.in (the "Site"), you agree to be bound by these Terms of Use and our
            Privacy Policy. If you do not agree, please do not use the Site. These terms apply to all visitors,
            registered users, subscribers, and anyone who accesses any content published on the Site.
          </p>
        </PolicySection>

        <PolicySection title="Content ownership and copyright">
          <p>
            All articles, photographs, videos, graphics, and other content published on the Site are the intellectual
            property of The Orbis Journal Media or, where credited, of the respective contributor or rights holder. Content is
            protected by Indian copyright law and applicable international treaties.
          </p>
          <p>
            You may share our articles on social media or link to them from other websites, provided you clearly attribute
            TThe Orbis Journal and include a direct link to the original article. Brief quotations (up to 100 words) for the purpose
            of commentary, criticism, or review are permitted under fair use.
          </p>
          <p>
            Republishing full articles, hosting our content on other websites, or commercial reproduction in any form is
            strictly prohibited without prior written permission. To request republication rights, contact
            permissions@theasr.in.
          </p>
        </PolicySection>

        <PolicySection title="User accounts">
          <p>
            You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality
            of your login credentials and for all activity that occurs under your account. Please notify us immediately if
            you believe your account has been compromised.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, post harmful or illegal content,
            engage in harassment, or are used for spam or automated data scraping.
          </p>
        </PolicySection>

        <PolicySection title="Comments and user submissions">
          <p>
            By posting a comment or submitting content to the Site, you grant The Orbis Journal a non-exclusive, royalty-free licence
            to publish, display, and distribute your submission. You represent that you own the rights to your submission and
            that it does not infringe the rights of any third party.
          </p>
          <p>
            We moderate comments and reserve the right to remove content that is defamatory, abusive, discriminatory, off-topic,
            or otherwise in violation of our community standards. Repeated violations may result in account suspension.
          </p>
        </PolicySection>

        <PolicySection title="Prohibited conduct">
          <p>You agree not to use the Site to: distribute malware or spam; scrape or harvest data using automated tools;
          impersonate another person or entity; post content that is defamatory, incites violence, or promotes hatred on
          the basis of religion, caste, ethnicity, gender, or sexual orientation; or engage in any activity that interferes
          with the Site's operation.</p>
        </PolicySection>

        <PolicySection title="Disclaimer and limitation of liability">
          <p>
            The Orbis Journal publishes journalism in good faith and strives for accuracy. However, we do not warrant that content on
            the Site is always complete, accurate, or up to date. Nothing on this Site constitutes legal, medical, or
            financial advice.
          </p>
          <p>
            To the maximum extent permitted by law, The Orbis Journal Media shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the Site or reliance on its content.
          </p>
        </PolicySection>

        <PolicySection title="Governing law">
          <p>
            These Terms are governed by the laws of India. Any dispute arising from your use of the Site shall be subject
            to the exclusive jurisdiction of the courts in New Delhi, India.
          </p>
        </PolicySection>

        <PolicySection title="Changes to these terms">
          <p>
            We may update these Terms from time to time. Material changes will be notified on the Site and, where appropriate,
            by email to registered users. Continued use of the Site after changes constitutes your acceptance of the revised terms.
          </p>
        </PolicySection>

        <div className="mt-10 pt-8 border-t border-gray-200 flex gap-4">
          <Link to="/contact" className="btn-primary">Contact Us <ArrowLeft size={13} className="rotate-180" /></Link>
          <Link to="/privacy" className="btn-secondary">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
