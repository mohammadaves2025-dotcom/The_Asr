import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, AuthState } from '../types';

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setState((s) => ({ ...s, accessToken: token }));
      authService
        .getMe()
        .then((res) => {
          const user = res.data.data.user;
          setState({ user, accessToken: token, isAuthenticated: true, isLoading: false });
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    const { user, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    const { user, accessToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    setState({ user, accessToken, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    await authService.logout().catch(() => {});
    localStorage.removeItem('accessToken');
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
  };

  const refreshUser = async () => {
    const res = await authService.getMe();
    const user = res.data.data.user;
    setState((s) => ({ ...s, user }));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
