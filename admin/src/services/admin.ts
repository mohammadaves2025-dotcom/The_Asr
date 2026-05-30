import api from './api';
import type { Article, User, Submission, ApiResponse } from '../types';

export const articlesAdmin = {
  getAll: (params: Record<string, any> = {}) =>
    api.get<ApiResponse<{ articles: Article[] }>>('/articles/admin/all', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<{ article: Article }>>(`/articles/admin/${id}`),

  create: (data: Partial<Article>) =>
    api.post<ApiResponse<{ article: Article }>>('/articles', data),

  update: (id: string, data: Partial<Article>) =>
    api.patch(`/articles/${id}`, data),

  delete: (id: string) => api.delete(`/articles/${id}`),

  uploadImage: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post<ApiResponse<{ url: string; publicId: string }>>('/articles/upload/image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  aiAssist: (messages: { role: string; content: string }[]) =>
    api.post('/ai/assist', { model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages }),
};

export const usersAdmin = {
  getAll: (params: Record<string, any> = {}) =>
    api.get<ApiResponse<{ users: User[] }>>('/users/admin/list', { params }),

  updateRole: (id: string, role: string) =>
    api.patch(`/users/admin/${id}/role`, { role }),

  toggleActive: (id: string) =>
    api.patch(`/users/admin/${id}/toggle-active`),
};

export const commentsAdmin = {
  getAll: (params: Record<string, any> = {}) =>
    api.get('/comments/admin', { params }),

  moderate: (commentId: string, status: string, note?: string) =>
    api.patch(`/comments/admin/${commentId}/moderate`, { status, note }),

  delete: (commentId: string) =>
    api.delete(`/comments/admin/${commentId}`),

  // Per-article (kept for compatibility)
  getPending: (articleId: string) =>
    api.get(`/articles/${articleId}/comments`),
};

export const submissionsAdmin = {
  getAll: (params: Record<string, any> = {}) =>
    api.get<ApiResponse<{ submissions: Submission[] }>>('/submissions/admin', { params }),

  updateStatus: (id: string, status: string, reviewNotes?: string) =>
    api.patch(`/submissions/admin/${id}/status`, { status, reviewNotes }),
};

export const categoriesAdmin = {
  getAll: () => api.get('/categories'),

  create: (data: Partial<import('../types').Category>) =>
    api.post('/categories', data),

  update: (id: string, data: Partial<import('../types').Category>) =>
    api.patch(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const newsletterAdmin = {
  getAll: (params: Record<string, any> = {}) =>
    api.get('/newsletter/admin/subscribers', { params }),
};

export const authAdmin = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', { email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data;
  },
  logout: () => api.post('/auth/logout'),
};
