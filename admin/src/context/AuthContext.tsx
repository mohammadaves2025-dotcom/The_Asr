import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authAdmin } from '../services/admin';
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
  const [state, setState] = useState<AuthState>({ user: null, isLoading: true, isAuthenticated: false });

  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      authAdmin.getMe()
        .then((res) => {
          const user = res.data!.user;
          if (!ADMIN_ROLES.includes(user.role)) {
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
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAdmin.login(email, password);
    const { user, accessToken } = res.data!;
    if (!ADMIN_ROLES.includes(user.role)) {
      throw new Error('Access denied. Admin privileges required.');
    }
    localStorage.setItem('adminAccessToken', accessToken);
    setState({ user, isLoading: false, isAuthenticated: true });
  };

  const logout = async () => {
    await authAdmin.logout().catch(() => {});
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
