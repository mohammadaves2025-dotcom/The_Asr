import api from './api';
import type { Article, ApiResponse, HomepageData } from '../types';

export interface ArticlesQuery {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  contentType?: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  search?: string;
  sort?: string;
  language?: string;
}

export const articlesService = {
  getArticles: async (query: ArticlesQuery = {}) => {
    const { data } = await api.get<ApiResponse<{ articles: Article[] }>>('/articles', { params: query });
    return data;
  },

  getArticle: async (slug: string) => {
    const { data } = await api.get<ApiResponse<{ article: Article; related: Article[] }>>(`/articles/${slug}`);
    return data;
  },

  getHomepageData: async () => {
    const { data } = await api.get<ApiResponse<HomepageData>>('/articles/homepage');
    return data;
  },
};

export const categoriesService = {
  getAll: async () => {
    const { data } = await api.get<ApiResponse<{ categories: import('../types').Category[] }>>('/categories');
    return data;
  },

  getOne: async (slug: string) => {
    const { data } = await api.get<ApiResponse<{ category: import('../types').Category }>>(`/categories/${slug}`);
    return data;
  },
};

export const commentsService = {
  getForArticle: async (articleId: string, page = 1) => {
    const { data } = await api.get<ApiResponse<{ comments: import('../types').Comment[] }>>(`/articles/${articleId}/comments`, { params: { page } });
    return data;
  },

  create: async (articleId: string, body: string, parentComment?: string) => {
    const { data } = await api.post<ApiResponse<{ comment: import('../types').Comment }>>(`/articles/${articleId}/comments`, { body, parentComment });
    return data;
  },

  getReplies: async (articleId: string, commentId: string) => {
    const { data } = await api.get<ApiResponse<{ replies: import('../types').Comment[] }>>(`/articles/${articleId}/comments/${commentId}/replies`);
    return data;
  },
};

export const newsletterService = {
  subscribe: async (email: string, name?: string, source = 'homepage') => {
    const { data } = await api.post('/newsletter/subscribe', { email, name, source });
    return data;
  },
};
