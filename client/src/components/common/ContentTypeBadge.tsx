import { cn, getContentTypeLabel } from '../../utils/helpers';

const TYPE_COLORS: Record<string, string> = {
  investigation: 'bg-accent-red text-white',
  opinion: 'bg-accent-amber text-white',
  analysis: 'bg-accent-blue text-white',
  'ground-report': 'bg-accent-green text-white',
  'verified-report': 'bg-accent-emerald text-white',
  'in-their-words': 'bg-accent-rose text-white',
  news: 'bg-brand-navy text-white',
  explainer: 'bg-accent-teal text-white',
};

interface Props {
  type: string;
  className?: string;
}

export default function ContentTypeBadge({ type, className }: Props) {
  return (
    <span
      className={cn(
        'text-[10px] font-bold font-sans uppercase tracking-widest px-2 py-0.5 inline-block',
        TYPE_COLORS[type] || 'bg-ink-muted text-white',
        className
      )}
    >
      {getContentTypeLabel(type)}
    </span>
  );
}
