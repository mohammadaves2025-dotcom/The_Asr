import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function NewsletterUnsubscribePage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    api
      .get(`/newsletter/unsubscribe/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <Logo variant="light" size="lg" />
        </div>

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-3 text-white/60 font-sans text-sm">
            <svg className="animate-spin h-5 w-5 text-brand-yellow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing your request…
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow/20 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-brand-yellow" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-3">Unsubscribed</h1>
            <p className="text-white/60 font-sans text-sm leading-relaxed mb-8">
              You've been removed from The Asr Dispatch. You won't receive any further emails from us.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/newsletter" className="btn-primary text-sm">
                Resubscribe
              </Link>
              <Link to="/" className="text-white/50 hover:text-white font-sans text-sm transition-colors">
                Back to home
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-3">Link not valid</h1>
            <p className="text-white/60 font-sans text-sm leading-relaxed mb-8">
              This unsubscribe link has already been used or has expired.
              If you're still receiving emails, please contact us.
            </p>
            <Link to="/contact" className="btn-primary text-sm">
              Contact us
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
