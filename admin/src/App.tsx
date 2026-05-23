import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AuthContext';
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleEditorPage from './pages/ArticleEditorPage';
import UsersPage from './pages/UsersPage';
import CommentsPage from './pages/CommentsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import CategoriesPage from './pages/CategoriesPage';
import NewsletterPage from './pages/NewsletterPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sidebar-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-serif font-bold text-white mb-2">Maktoob<span className="text-brand-yellow">.</span></div>
          <p className="text-xs font-sans text-white/30 uppercase tracking-widest">Loading CMS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/new" element={<ArticleEditorPage />} />
        <Route path="/articles/:id/edit" element={<ArticleEditorPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/comments" element={<CommentsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminAuthProvider>
          <ProtectedRoutes />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', fontSize: '13px', borderRadius: 0 },
              success: { iconTheme: { primary: '#122837', secondary: '#FBFC09' } },
            }}
          />
        </AdminAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
