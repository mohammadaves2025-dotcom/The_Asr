import api from './api';
import type { Article, ApiResponse, Category } from '../types';

export const articlesService = {
  getAll: (params: Record<string, any> = {}) =>
    api.get<ApiResponse<{ articles: Article[]; total: number }>>('/articles', { params }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<{ article: Article; related?: Article[] }>>(`/articles/${slug}`),

  // Increment view count (fire and forget)
  incrementViews: (slugOrId: string) =>
    api.post(`/articles/${slugOrId}/views`).catch(() => {}),

  getComments: (articleId: string) =>
    api.get(`/articles/${articleId}/comments`),

  addComment: (articleId: string, data: { body: string; parentComment?: string }) =>
    api.post(`/articles/${articleId}/comments`, data),
};

export const categoriesService = {
  getAll: () =>
    api.get<ApiResponse<{ categories: Category[] }>>('/categories'),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<{ category: Category }>>(`/categories/${slug}`),
};
