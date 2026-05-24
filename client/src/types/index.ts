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
  savedArticles?: string[]; // array of article ObjectId strings
  createdAt: string;
  lastLogin?: string;
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
    publicId?: string;
    alt?: string;
    caption?: string;
    credit?: string;
  };
  gallery?: Array<{ url: string; alt?: string; caption?: string }>;
  videoUrl?: string;
  category: Category;
  tags?: string[];
  contentType: string;
  series?: string;
  seriesPart?: number;
  author: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
    bio?: string;
    designation?: string;
  };
  coAuthors?: Array<{ _id: string; name: string }>;
  isGuestAuthor?: boolean;
  guestAuthorName?: string;
  guestAuthorBio?: string;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  publishedAt?: string;
  scheduledFor?: string;
  isFeatured: boolean;
  isBreaking: boolean;
  isEditorsPick: boolean;
  isMustRead: boolean;
  isVerified: boolean;
  isPremium: boolean;
  views: number;
  readTime: number;
  likes: number;
  shares: number;
  commentsCount: number;
  location?: { state?: string; district?: string; country?: string };
  language: 'en' | 'ur' | 'hi';
  corrections?: Array<{ note: string; correctedAt: string }>;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    keywords?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}
