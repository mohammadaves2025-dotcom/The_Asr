import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_ROLES = ['editor', 'admin', 'superadmin'];

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }

    // Verify token is still valid by hitting /auth/me
    api.get('/auth/me')
      .then((res) => {
        // Backend returns: { success, message, data: { user } }
        const user: User = res.data?.data?.user;
        if (!user || !ADMIN_ROLES.includes(user.role)) {
          localStorage.removeItem('adminAccessToken');
          setState({ user: null, isLoading: false, isAuthenticated: false });
        } else {
          setState({ user, isLoading: false, isAuthenticated: true });
        }
      })
      .catch(() => {
        localStorage.removeItem('adminAccessToken');
        setState({ user: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  const login = async (email: string, password: string) => {
    // Backend returns: { success, message, data: { user, accessToken } }
    const res = await api.post('/auth/login', { email, password });
    const { user, accessToken } = res.data?.data ?? {};

    if (!user || !accessToken) {
      throw new Error('Invalid server response during login');
    }
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new Error('Access denied. Editor, Admin or Superadmin account required.');
    }

    localStorage.setItem('adminAccessToken', accessToken);
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('adminAccessToken');
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
