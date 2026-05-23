import { cn, CONTENT_TYPE_LABELS } from '../../utils/helpers';

const TYPE_COLORS: Record<string, string> = {
  investigation: 'bg-accent-red text-white',
  opinion: 'bg-accent-teal text-white',
  analysis: 'bg-accent-blue text-white',
  'ground-report': 'bg-accent-green text-white',
  'verified-report': 'bg-accent-emerald text-white',
  'in-their-words': 'bg-accent-rose text-white',
  news: 'bg-brand-navy text-white',
  explainer: 'bg-accent-amber text-white',
  interview: 'bg-purple-600 text-white',
  'photo-essay': 'bg-pink-600 text-white',
  'community-voice': 'bg-orange-600 text-white',
  'special-series': 'bg-indigo-600 text-white',
};

interface Props {
  // accepts both `type` (old) and `contentType` (new) for compatibility
  type?: string;
  contentType?: string;
  className?: string;
}

export default function ContentTypeBadge({ type, contentType, className }: Props) {
  const t = contentType ?? type ?? 'news';
  if (!t) return null;
  return (
    <span className={cn(
      'text-[10px] font-bold font-sans uppercase tracking-widest px-2 py-0.5 inline-block',
      TYPE_COLORS[t] || 'bg-gray-600 text-white',
      className
    )}>
      {CONTENT_TYPE_LABELS[t] ?? t}
    </span>
  );
}
