export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  designation?: string;
  role: 'subscriber' | 'contributor' | 'editor' | 'admin' | 'superadmin';
  socialLinks?: { twitter?: string; linkedin?: string; website?: string };
  isVerified: boolean;
  isActive: boolean;
  newsletterSubscribed: boolean;
  savedArticles?: Article[];
  followedCategories?: string[];
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isFeatured: boolean;
  isActive: boolean;
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
  featuredImage?: {
    url: string;
    alt?: string;
    caption?: string;
    credit?: string;
  };
  category: Category;
  tags?: string[];
  contentType: ContentType;
  author: AuthorSnippet;
  coAuthors?: AuthorSnippet[];
  isGuestAuthor?: boolean;
  guestAuthorName?: string;
  status: ArticleStatus;
  publishedAt?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  isEditorsPick: boolean;
  isMustRead: boolean;
  isVerified: boolean;
  views: number;
  readTime: number;
  likes: number;
  commentsCount: number;
  location?: { state?: string; district?: string; country?: string };
  language: 'en' | 'ur' | 'hi';
  series?: string;
  seriesPart?: number;
  createdAt: string;
  updatedAt: string;
}

export type ArticleStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived';

export type ContentType =
  | 'news' | 'investigation' | 'opinion' | 'analysis' | 'ground-report'
  | 'explainer' | 'interview' | 'photo-essay' | 'video-report' | 'book-excerpt'
  | 'special-series' | 'community-voice' | 'verified-report' | 'in-their-words';

export interface AuthorSnippet {
  _id: string;
  name: string;
  avatar?: string;
  designation?: string;
  bio?: string;
  socialLinks?: { twitter?: string; linkedin?: string; website?: string };
}

export interface Comment {
  _id: string;
  article: string;
  author: AuthorSnippet;
  body: string;
  parentComment?: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  likes: number;
  isEdited: boolean;
  replyCount?: number;
  createdAt: string;
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

export interface HomepageData {
  hero: Article | null;
  featured: Article[];
  latest: Article[];
  breaking: Array<{ _id: string; title: string; slug: string; category: Category }>;
  opinionPicks: Article[];
  categoryPreviews: Array<{
    _id: string;
    categoryName: string;
    categoryColor: string;
    articles: Article[];
  }>;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
