import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ variant = 'dark', size = 'md', className }: LogoProps) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };

  return (
    <Link to="/" className={cn('inline-flex items-center gap-1 no-underline select-none', className)}>
      <span
        className={cn(
          'font-serif font-bold tracking-tight leading-none',
          sizes[size],
          variant === 'dark' ? 'text-brand-navy' : 'text-white'
        )}
      >
        The Asr
      </span>
      <span
        className={cn(
          'font-serif font-bold leading-none',
          sizes[size],
          'text-brand-yellow'
        )}
        style={{ textShadow: variant === 'light' ? 'none' : undefined }}
      >
        .
      </span>
    </Link>
  );
}
