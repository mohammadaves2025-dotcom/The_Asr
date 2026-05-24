import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const META: Record<string, { title: string; description: string; body: string }> = {
  CorrectionsPage: {
    title: 'Corrections Policy',
    description: 'How we acknowledge and correct errors.',
    body: 'The Asr is committed to accuracy. When we make an error, we correct it promptly and transparently. Corrections are published on the original article and noted with the date of correction. To report an error, please contact corrections@theasr.in or use our contact form.',
  },
  EditorialPolicyPage: {
    title: 'Editorial Policy',
    description: 'Our standards for sourcing, verification, and editorial independence.',
    body: 'The Asr publishes original reporting on human rights, minority communities, and social justice. We are committed to accuracy, fairness, and editorial independence. No article may be published without independent verification of facts. Our newsroom is funded entirely by readers and does not accept money from governments, political parties, or corporate advertisers.',
  },
  FundingPage: {
    title: 'Funding & Transparency',
    description: 'Where our money comes from.',
    body: 'The Asr is funded entirely by reader donations, subscriptions, and journalism grants from independent foundations. We do not carry advertising or accept money from government agencies, political parties, or corporations that may have a stake in our coverage. A full list of funders is available on this page and updated annually.',
  },
  GrievancePage: {
    title: 'Grievance Redressal',
    description: 'A formal process for complaints about our coverage.',
    body: 'If you believe The Asr has misrepresented facts, infringed on your privacy, or violated our editorial standards, you may file a formal grievance. Our Grievance Officer will review your complaint within 14 working days and respond in writing. Please write to grievance@theasr.in with full details.',
  },
  PrivacyPage: {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your data.',
    body: 'The Asr collects minimal personal data — your email if you subscribe to our newsletter, and basic analytics to understand what stories matter. We do not sell your data. We use cookies solely for analytics and do not share personal information with third parties without your consent. Full GDPR compliance details are available on request.',
  },
  TermsPage: {
    title: 'Terms of Use',
    description: 'The terms governing your use of this site.',
    body: 'By using The Asr website, you agree to our terms of service. All content published on this site is the intellectual property of The Asr Media unless otherwise noted. You may share articles with attribution and a link to the original. Commercial reproduction without written permission is prohibited.',
  },
};

export default function EditorialPolicyPage() {
  const meta = META['EditorialPolicyPage'];
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <h1 className="text-3xl font-serif font-bold text-white">{meta?.title}</h1>
          {meta?.description && <p className="text-white/50 text-sm font-sans mt-2">{meta.description}</p>}
        </div>
      </div>
      <div className="container-site py-10 md:py-14 max-w-3xl">
        <p className="text-[15px] leading-[1.85] text-ink-secondary font-sans">{meta?.body}</p>
        <div className="mt-10 pt-8 border-t border-gray-200">
          <Link to="/contact" className="btn-primary">Contact Us <ArrowLeft size={13} className="rotate-180" /></Link>
        </div>
      </div>
    </div>
  );
}
