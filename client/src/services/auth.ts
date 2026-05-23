import api from './api';
import type { User, ApiResponse } from '../types';

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', { name, email, password });
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', { email, password });
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getMe: async () => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data;
  },

  forgotPassword: async (email: string) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token: string, password: string, confirmPassword: string) => {
    const { data } = await api.patch(`/auth/reset-password/${token}`, { password, confirmPassword });
    return data;
  },

  updatePassword: async (currentPassword: string, newPassword: string) => {
    const { data } = await api.patch('/auth/update-password', { currentPassword, newPassword });
    return data;
  },
};
