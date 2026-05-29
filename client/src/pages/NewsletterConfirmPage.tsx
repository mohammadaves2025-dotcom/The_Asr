import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import api from '../services/api';
import Logo from '../components/common/Logo';

export default function NewsletterConfirmPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    api
      .get(`/newsletter/confirm/${token}`)
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
            Confirming your subscription…
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-3">You're subscribed!</h1>
            <p className="text-white/60 font-sans text-sm leading-relaxed mb-8">
              Welcome to The Maktoob Dispatch. You'll receive our weekly digest of the most important
              rights and accountability stories every Tuesday.
            </p>
            <Link to="/" className="btn-primary text-sm">
              Read the latest stories →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <AlertCircle size={32} className="text-red-400" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white mb-3">Link expired</h1>
            <p className="text-white/60 font-sans text-sm leading-relaxed mb-8">
              This confirmation link has already been used or has expired.
              If you haven't confirmed your subscription yet, please subscribe again.
            </p>
            <Link to="/newsletter" className="btn-primary text-sm">
              Subscribe again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
