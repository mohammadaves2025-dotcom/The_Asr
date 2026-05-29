import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Wrap any route that requires authentication.
 *
 * Behaviour:
 * - isLoading → show a blank screen (auth check in progress, no flash)
 * - not authenticated → redirect to /login, preserving the attempted URL in
 *   location.state.from so LoginPage can send them back after sign-in
 * - authenticated → render children
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Auth check still running — render nothing, don't redirect yet
  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <svg
          className="animate-spin h-6 w-6 text-brand-navy opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
