import api from './api';
import type { Article, ApiResponse, Category } from '../types';

export const articlesService = {
  getAll: (params: Record<string, any> = {}) =>
    api.get<ApiResponse<{ articles: Article[]; total: number }>>('/articles', { params }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<{ article: Article }>>(`/articles/${slug}`),

  search: (query: string) =>
    api.get<ApiResponse<{ articles: Article[] }>>('/articles/search', { params: { q: query } }),

  getByCategory: (slug: string, params: Record<string, any> = {}) =>
    api.get<ApiResponse<{ articles: Article[]; category: Category }>>(`/articles/category/${slug}`, { params }),

  getComments: (articleId: string) =>
    api.get(`/articles/${articleId}/comments`),

  addComment: (articleId: string, data: { content: string }) =>
    api.post(`/articles/${articleId}/comments`, data),

  saveArticle: (articleId: string) =>
    api.post(`/articles/${articleId}/save`),

  unsaveArticle: (articleId: string) =>
    api.delete(`/articles/${articleId}/save`),

  incrementViews: (articleId: string) =>
    api.post(`/articles/${articleId}/views`),
};

export const categoriesService = {
  getAll: () =>
    api.get<ApiResponse<{ categories: Category[] }>>('/categories'),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<{ category: Category }>>(`/categories/${slug}`),
};
