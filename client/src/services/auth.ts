import api from './api';
import type { ApiResponse, User } from '../types';

export const authService = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', data),

  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', { email, password }),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.patch('/auth/profile', data),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/update-password', data),
};
