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
