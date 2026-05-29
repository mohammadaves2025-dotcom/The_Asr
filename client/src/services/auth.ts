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

  // FIX: was '/auth/profile' — correct route is '/users/me/profile'
  updateProfile: (data: FormData | Partial<User>) =>
    api.patch('/users/me/profile', data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/update-password', data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.patch(`/auth/reset-password/${token}`, { password }),

  /**
   * Save the current path so we can restore it after the OAuth redirect.
   * Then navigate the full page to the Google OAuth endpoint.
   */
  initiateGoogleOAuth: (returnTo = '/') => {
    sessionStorage.setItem('oauthReturnTo', returnTo);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
    window.location.href = `${base}/auth/google`;
  },
};
