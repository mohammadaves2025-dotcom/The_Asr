import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { AuthState } from '../types';

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
    accessToken: localStorage.getItem('accessToken'),
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService.getMe()
        .then((res) => {
          setState({ user: res.data!.user, accessToken: token, isLoading: false, isAuthenticated: true });
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    const { user, accessToken } = res.data!;
    localStorage.setItem('accessToken', accessToken);
    setState({ user, accessToken, isLoading: false, isAuthenticated: true });
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register(name, email, password);
    const { user, accessToken } = res.data!;
    localStorage.setItem('accessToken', accessToken);
    setState({ user, accessToken, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    await authService.logout().catch(() => {});
    localStorage.removeItem('accessToken');
    setState({ user: null, accessToken: null, isLoading: false, isAuthenticated: false });
  };

  const refreshUser = async () => {
    const res = await authService.getMe();
    setState((s) => ({ ...s, user: res.data!.user }));
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
