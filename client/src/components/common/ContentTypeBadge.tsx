interface Props {
  type: string;
  className?: string;
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  news:               { label: 'News',            color: 'bg-brand-red/10 text-brand-red' },
  investigation:      { label: 'Investigation',   color: 'bg-accent-purple/10 text-accent-purple' },
  opinion:            { label: 'Opinion',         color: 'bg-brand-navy/10 text-brand-navy' },
  'ground-report':    { label: 'Ground Report',   color: 'bg-brand-navy/10 text-brand-navy' },
  'double-lens':      { label: 'Double Lens',     color: 'bg-brand-navy/10 text-brand-navy' },
  'verified-report':  { label: '✓ Verified',      color: 'bg-accent-green/10 text-accent-green' },
  'photo-essay':      { label: 'Photo Essay',     color: 'bg-accent-amber/10 text-accent-amber' },
  explainer:          { label: 'Explainer',       color: 'bg-accent-teal/10 text-accent-teal' },
  interview:          { label: 'Interview',       color: 'bg-accent-green/10 text-accent-green' },
  'community-voice':  { label: 'Community Voice', color: 'bg-emerald-100 text-emerald-700' },
  'orbis-original':   { label: 'The Orbis Original',  color: 'bg-brand-red/10 text-brand-red' },
  'features':         { label: 'Features',        color: 'bg-brand-yellow/20 text-brand-navy' },
};

export default function ContentTypeBadge({ type, className = '' }: Props) {
  const m = TYPE_MAP[type] ?? { label: type, color: 'bg-gray-100 text-ink-muted' };
  return (
    <span className={`inline-block text-[9px] font-black uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${m.color} ${className}`}>
      {m.label}
    </span>
  );
}