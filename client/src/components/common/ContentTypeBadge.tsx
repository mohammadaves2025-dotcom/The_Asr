interface Props {
  type: string;
  className?: string;
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  investigation: { label: 'Investigation', color: 'bg-accent-purple/10 text-accent-purple' },
  opinion: { label: 'Opinion', color: 'bg-brand-navy/10 text-brand-navy' },
  explainer: { label: 'Explainer', color: 'bg-accent-teal/10 text-accent-teal' },
  'photo-essay': { label: 'Photo Essay', color: 'bg-accent-amber/10 text-accent-amber' },
  interview: { label: 'Interview', color: 'bg-accent-green/10 text-accent-green' },
  news: { label: 'News', color: 'bg-brand-red/10 text-brand-red' },
  video: { label: 'Video', color: 'bg-red-100 text-red-700' },
  'community-voices': { label: 'Community Voice', color: 'bg-emerald-100 text-emerald-700' },
};

export default function ContentTypeBadge({ type, className = '' }: Props) {
  const m = TYPE_MAP[type] ?? { label: type, color: 'bg-gray-100 text-ink-muted' };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${m.color} ${className}`}>
      {m.label}
    </span>
  );
} 