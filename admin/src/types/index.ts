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
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  articleCount?: number;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  body?: string;
  featuredImage?: { url: string; alt?: string; caption?: string; credit?: string };
  category: Category;
  tags?: string[];
  contentType: string;
  author: { _id: string; name: string; email?: string; avatar?: string };
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  publishedAt?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  isEditorsPick: boolean;
  isVerified: boolean;
  views: number;
  readTime: number;
  likes: number;
  commentsCount: number;
  language: 'en' | 'ur' | 'hi';
  createdAt: string;
  updatedAt: string;
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
  type: 'tip' | 'community-voice' | 'letter-to-editor' | 'youth-writer' | 'correction';
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
