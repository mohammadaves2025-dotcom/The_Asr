import { Link } from 'react-router-dom';
import Logo from '../components/common/Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-center px-6">
      <Logo variant="light" size="lg" className="mb-8" />
      <p className="text-8xl font-serif font-bold text-brand-yellow mb-4">404</p>
      <h1 className="text-3xl font-serif font-bold text-white mb-4">Page not found</h1>
      <p className="text-white/60 font-sans mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-yellow">Back to Home</Link>
    </div>
  );
}
