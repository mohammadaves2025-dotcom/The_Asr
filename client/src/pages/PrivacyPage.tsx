import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-serif font-bold text-ink mb-3 pb-2 border-b border-gray-200">{title}</h2>
      <div className="space-y-3 text-[15px] leading-[1.85] text-ink-secondary font-sans">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-paper min-h-screen">
      <div className="bg-brand-navy">
        <div className="container-site py-8 md:py-10">
          <Link to="/" className="text-white/40 hover:text-white text-[10px] font-sans font-bold uppercase tracking-[2px] flex items-center gap-1.5 mb-4 transition-colors">
            <ArrowLeft size={11} /> Home
          </Link>
          <div className="flex items-center gap-3">
            <Shield size={22} className="text-brand-yellow" />
            <h1 className="text-3xl font-serif font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-white/50 text-sm font-sans mt-2">How we collect, use, and protect your personal data.</p>
          <p className="text-white/30 text-xs font-sans mt-1">Last updated: January 2025</p>
        </div>
      </div>

      <div className="container-site py-10 md:py-14 max-w-3xl">

        <PolicySection title="Overview">
          <p>
            The Orbis Journal ("we", "our", "the newsroom") is committed to protecting your privacy. This policy explains what personal
            information we collect when you visit theasr.in, why we collect it, and how we handle it. We collect the minimum
            data necessary to operate the site and communicate with our readers. We do not sell your data to anyone, ever.
          </p>
        </PolicySection>

        <PolicySection title="What we collect and why">
          <p><strong className="text-ink">Email address</strong> — If you subscribe to our newsletter or create an account, we store your email to send
          you articles and updates you asked for. You can unsubscribe at any time using the link in any email.</p>
          <p><strong className="text-ink">Name</strong> — Provided voluntarily when you register, comment, or submit a tip. Used only to display your
          byline or identity in comments and correspondence.</p>
          <p><strong className="text-ink">Usage data</strong> — We use anonymised analytics (page views, article reach, referral sources) to understand
          what topics matter to our readers and how to serve them better. This data is never tied to your identity.</p>
          <p><strong className="text-ink">Cookies</strong> — We use cookies only for session management (keeping you logged in) and anonymised analytics.
          We do not use advertising cookies or third-party tracking pixels.</p>
          <p><strong className="text-ink">Voluntary submissions</strong> — If you submit a tip, ground report, or letter to the editor, we store the
          content and your contact details to respond and, if applicable, publish with your permission.</p>
        </PolicySection>

        <PolicySection title="What we do not collect">
          <p>We do not collect payment details directly — donations are processed by third-party payment providers (UPI, Razorpay, PayPal)
          who have their own privacy policies. We do not receive or store card numbers or bank details.</p>
          <p>We do not use your data for advertising profiling, and we do not share or sell your personal data to any third party,
          including government agencies, unless compelled by a valid legal order under Indian law — in which case we will inform you
          unless prohibited from doing so.</p>
        </PolicySection>

        <PolicySection title="Data retention">
          <p>Newsletter subscriber data is held as long as you remain subscribed. Account data is retained as long as your account
          is active. You may request deletion of your account and associated personal data at any time by writing to
          privacy@theasr.in. We will action deletion requests within 30 days.</p>
        </PolicySection>

        <PolicySection title="Third-party services">
          <p>We use a small number of third-party tools to operate the site: Cloudinary for image hosting, an email delivery
          provider for newsletters, and a payment processor for donations. Each of these providers processes data only on our
          behalf and under contractual data-processing agreements. We do not authorise them to use your data for their own
          marketing.</p>
        </PolicySection>

        <PolicySection title="Your rights">
          <p>You have the right to access the personal data we hold about you, to request correction of inaccurate data, and to
          request deletion. You may also object to certain processing or request that we restrict processing in some circumstances.
          To exercise any of these rights, contact us at privacy@theasr.in.</p>
          <p>For readers in the European Union, these rights are guaranteed under the GDPR. We treat these rights as universal and
          will honour them regardless of your location.</p>
        </PolicySection>

        <PolicySection title="Contact">
          <p>For any privacy concerns, please write to <strong className="text-ink">privacy@theasr.in</strong>. For formal complaints,
          please use our <Link to="/grievance" className="text-brand-red hover:underline">Grievance Redressal</Link> process.</p>
        </PolicySection>

        <div className="mt-10 pt-8 border-t border-gray-200 flex gap-4">
          <Link to="/contact" className="btn-primary">Contact Us <ArrowLeft size={13} className="rotate-180" /></Link>
          <Link to="/terms" className="btn-secondary">Terms of Use</Link>
        </div>
      </div>
    </div>
  );
}
