// admin/src/types/index.ts
// Changes: User interface extended with bio, designation, instagram, facebook, youtube

export interface User {
  _id:                  string;
  name:                 string;
  email:                string;
  avatar?:              string;
  bio?:                 string;         // ← was missing from admin types
  designation?:         string;         // ← was missing from admin types
  role:                 'subscriber' | 'contributor' | 'editor' | 'admin' | 'superadmin';
  isVerified:           boolean;
  isActive:             boolean;
  newsletterSubscribed: boolean;
  createdAt:            string;
  lastLogin?:           string;
  articlesCount?:       number;
  socialLinks?: {
    twitter?:           string;
    linkedin?:          string;
    website?:           string;
    instagram?:         string;   // ← new
    facebook?:          string;   // ← new
    youtube?:           string;   // ← new
  };
}

export interface Category {
  _id:          string;
  name:         string;
  slug:         string;
  description?: string;
  color?:       string;
  order?:       number;
  isActive:     boolean;
  isFeatured:   boolean;   // true = show in primary navbar; false = show in More dropdown
  articleCount: number;
}

export interface Article {
  _id:              string;
  title:            string;
  slug:             string;
  subtitle?:        string;
  excerpt:          string;
  body:             string;
  status:           'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  contentType:      string;
  category?:        Category;
  tags?:            string[];
  author?:          User;
  coAuthors?:       User[];
  isGuestAuthor?:   boolean;
  guestAuthorName?: string;
  guestAuthorBio?:  string;
  featuredImage?: {
    url:       string;
    publicId?: string;
    alt?:      string;
    caption?:  string;
    credit?:   string;
  };
  videoUrl?:        string;
  isFeatured?:      boolean;
  isBreaking?:      boolean;
  isEditorsPick?:   boolean;
  isMustRead?:      boolean;
  isVerified?:      boolean;
  isPremium?:       boolean;
  views?:           number;
  readTime?:        number;
  likes?:           number;
  commentsCount?:   number;
  publishedAt?:     string;
  scheduledFor?:    string;
  series?:          string;
  seriesPart?:      number;
  language?:        'en' | 'ur' | 'hi';
  seo?: {
    metaTitle?:       string;
    metaDescription?: string;
    ogImage?:         string;
    keywords?:        string[];
    canonicalUrl?:    string;
  };
  corrections?: {
    note:        string;
    correctedAt: string;
  }[];
  createdAt:    string;
  updatedAt:    string;
  relatedArticles?: Article[];
}

export interface Comment {
  _id:           string;
  body:          string;
  author?:       User;
  article?:      { _id: string; title: string; slug: string };
  status:        'pending' | 'approved' | 'rejected';
  isApproved:    boolean;
  parentComment?: string;
  createdAt:     string;
}

export interface Submission {
  _id:           string;
  name:          string;
  email:         string;
  type:          string;
  title:         string;
  content:       string;
  status:        'pending' | 'approved' | 'rejected';
  reviewNotes?:  string;
  createdAt:     string;
}

export interface ApiResponse<T = unknown> {
  success:  boolean;
  message?: string;
  data?:    T;
  meta?: {
    total:       number;
    page:        number;
    limit:       number;
    totalPages:  number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginationMeta {
  total:       number;
  page:        number;
  limit:       number;
  totalPages:  number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}