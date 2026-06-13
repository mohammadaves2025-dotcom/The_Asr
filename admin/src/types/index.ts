export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  designation?: string;
  role: 'subscriber' | 'contributor' | 'editor' | 'admin' | 'superadmin';
  isVerified: boolean;
  isActive: boolean;
  newsletterSubscribed: boolean;
  createdAt: string;
  lastLogin?: string;
  articlesCount?: number;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isFeatured: boolean;   // true = show in primary navbar
  showInMore: boolean;   // true = show in More dropdown
  isActive: boolean;     // false = hidden from public entirely
  order: number;
  articleCount?: number;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  body?: string;
  featuredImage?: { url: string; alt?: string; caption?: string; credit?: string };
  category: Category | string;
  tags?: string[];
  contentType: string;
  author: { _id: string; name: string; email?: string; avatar?: string };
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  scheduledFor?: string;
  publishedAt?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  isEditorsPick: boolean;
  isMustRead?: boolean;
  isVerified: boolean;
  isPremium?: boolean;
  isGuestAuthor?: boolean;
  guestAuthorName?: string;
  guestAuthorBio?: string;
  views: number;
  readTime: number;
  likes: number;
  commentsCount: number;
  language: 'en' | 'ur' | 'hi';
  series?: string;
  seriesPart?: number;
  videoUrl?: string;
  location?: { state?: string; district?: string; country?: string };
  seo?: { metaTitle?: string; metaDescription?: string };
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface Comment {
  _id: string;
  article: { _id: string; title: string; slug: string } | string;
  author: { _id: string; name: string; avatar?: string };
  body: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reportCount: number;
  likes: number;
  createdAt: string;
}

export interface Submission {
  _id: string;
  type: 'tip' | 'community-voice' | 'letter-to-editor' | 'youth-writer' | 'correction' | 'contact';
  name: string;
  email: string;
  subject: string;
  body: string;
  status: 'new' | 'under-review' | 'accepted' | 'rejected' | 'published';
  assignedTo?: User;
  reviewNotes?: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  name?: string;
  isConfirmed: boolean;
  subscribedAt?: string;
  source: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalUsers: number;
  totalComments: number;
  pendingComments: number;
  totalViews: number;
  newsletters: number;
}
