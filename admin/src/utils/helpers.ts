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

export function formatDateTime(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy HH:mm');
}

export function formatRelative(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export const STATUS_COLORS: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  review: 'bg-amber-100 text-amber-700',
  archived: 'bg-red-100 text-red-600',
  scheduled: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  flagged: 'bg-orange-100 text-orange-700',
  new: 'bg-blue-100 text-blue-700',
  'under-review': 'bg-amber-100 text-amber-700',
  accepted: 'bg-green-100 text-green-700',
};

export const ROLE_COLORS: Record<string, string> = {
  superadmin: 'bg-brand-navy text-brand-yellow',
  admin: 'bg-brand-navy/10 text-brand-navy',
  editor: 'bg-accent-teal/10 text-accent-teal',
  contributor: 'bg-accent-amber/10 text-accent-amber',
  subscriber: 'bg-gray-100 text-gray-500',
};
