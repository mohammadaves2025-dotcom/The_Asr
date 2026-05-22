import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateLong(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMMM d, yyyy');
}

export function formatReadTime(minutes: number) {
  if (minutes < 1) return '< 1 min read';
  return `${minutes} min read`;
}

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  news: 'News',
  investigation: 'Investigation',
  opinion: 'Opinion',
  analysis: 'Analysis',
  'ground-report': 'Ground Report',
  explainer: 'Explainer',
  interview: 'Interview',
  'photo-essay': 'Photo Essay',
  'video-report': 'Video Report',
  'book-excerpt': 'Book Excerpt',
  'special-series': 'Special Series',
  'community-voice': 'Community Voice',
  'verified-report': 'Verified Report',
  'in-their-words': 'In Their Words',
};

export function getContentTypeLabel(type: string) {
  return CONTENT_TYPE_LABELS[type] || type;
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '…';
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
