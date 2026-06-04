export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateLong = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getContentTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    investigation: 'Investigation',
    opinion: 'Opinion',
    analysis: 'Analysis',
    'ground-report': 'Ground Report',
    'verified-report': 'Verified Report',
    'in-their-words': 'In Their Words',
    news: 'News',
    explainer: 'Explainer',
  };
  return labels[type] || type;
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const truncate = (text: string, length: number = 150): string => {
  return text.length > length ? text.slice(0, length) + '...' : text;
};

export const slugify = (text: string): string => {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
};

export const formatRelative = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  'news': 'News',
  'investigation': 'Investigation',
  'opinion': 'Opinion',
  'analysis': 'Analysis',
  'ground-report': 'Ground Report',
  'explainer': 'Explainer',
  'interview': 'Interview',
  'photo-essay': 'Photo Essay',
  'video-report': 'Video',
  'book-excerpt': 'Book Excerpt',
  'special-series': 'Special Series',
  'community-voice': 'Community Voice',
  'verified-report': 'Verified',
  'in-their-words': 'In Their Words',
};

export const formatReadTime = (mins: number): string => {
  if (!mins || mins < 1) return '1 min read';
  return `${mins} min read`;
};

// Normalise raw author names coming from the backend.
// "Admin" is the default admin account name — display as the editorial desk instead.
const DESK_NAMES = new Set(['Admin', 'admin', 'The Asr', 'The Orbis Journal']);
export function resolveAuthorName(raw: string | undefined | null): string {
  if (!raw || DESK_NAMES.has(raw.trim())) return 'The Orbis Journal Desk';
  return raw.trim();
}