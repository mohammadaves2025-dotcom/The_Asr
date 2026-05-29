import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

/**
 * Landing page for Google OAuth redirect.
 * Backend redirects here as: /auth/callback?token=<accessToken>&role=<role>
 * We store the token, hydrate the user via getMe(), then send them home (or
 * wherever they came from, stored in sessionStorage before the OAuth redirect).
 */
export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=oauth', { replace: true });
      return;
    }

    handleOAuthCallback(token)
      .then(() => {
        const returnTo = sessionStorage.getItem('oauthReturnTo') || '/';
        sessionStorage.removeItem('oauthReturnTo');
        navigate(returnTo, { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth', { replace: true });
      });
  }, []);

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Logo variant="light" size="lg" />
        </div>
        <div className="flex items-center justify-center gap-3 text-white/60 font-sans text-sm">
          <svg
            className="animate-spin h-5 w-5 text-brand-yellow"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Signing you in…
        </div>
      </div>
    </div>
  );
}
