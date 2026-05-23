export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'editor' | 'admin' | 'superadmin';
  createdAt: string;
}

export interface Author {
  _id: string;
  name: string;
  avatar?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: Category;
  author: Author;
  type: 'investigation' | 'opinion' | 'analysis' | 'ground-report' | 'verified-report' | 'in-their-words' | 'news' | 'explainer';
  status: 'draft' | 'review' | 'published' | 'archived';
  isFeatured: boolean;
  isBreaking: boolean;
  isEditorsPick: boolean;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: Author;
  articleId: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
