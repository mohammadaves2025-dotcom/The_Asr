// client/src/App.tsx
// Changes (Step 11 — route cleanup):
//   - /register → redirects to /login (Register removed from UI per client)
//   - /team → redirects to /about (Our Team removed from nav per client)
//   - /verified alias removed (Verified section removed from nav per client)
//   - /newsletter page kept ONLY for the email confirm/unsubscribe links
//   - /series alias kept (still a valid content format)
//   - All page files still exist on disk — just no longer linked from nav/footer

import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import HomePage                  from './pages/HomePage';
import ArticlePage               from './pages/ArticlePage';
import CategoryPage              from './pages/CategoryPage';
import SearchPage                from './pages/SearchPage';
import TagPage                   from './pages/TagPage';
import AuthorPage                from './pages/AuthorPage';
import LoginPage                 from './pages/LoginPage';
import ProfilePage               from './pages/ProfilePage';
import SupportPage               from './pages/SupportPage';
import SubmissionsPage           from './pages/SubmissionsPage';
import AboutPage                 from './pages/AboutPage';
import ContactPage               from './pages/ContactPage';
import EditorialPolicyPage       from './pages/EditorialPolicyPage';
import FundingPage               from './pages/FundingPage';
import CorrectionsPage           from './pages/CorrectionsPage';
import PrivacyPage               from './pages/PrivacyPage';
import TermsPage                 from './pages/TermsPage';
import GrievancePage             from './pages/GrievancePage';
import NotFoundPage              from './pages/NotFoundPage';

// Guards
import ProtectedRoute            from './components/common/ProtectedRoute';

// OAuth & password reset
import GoogleCallbackPage        from './pages/GoogleCallbackPage';
import ForgotPasswordPage        from './pages/ForgotPasswordPage';
import ResetPasswordPage         from './pages/ResetPasswordPage';
import NewsletterConfirmPage     from './pages/NewsletterConfirmPage';
import NewsletterUnsubscribePage from './pages/NewsletterUnsubscribePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Layout />
      </AuthProvider>
    ),
    children: [

      /* ── Core ──────────────────────────────────────────────────────────── */
      { path: '/',               element: <HomePage /> },
      { path: '/article/:slug',  element: <ArticlePage /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/search',         element: <SearchPage /> },
      { path: '/tag/:tag',       element: <TagPage /> },
      { path: '/author/:id',     element: <AuthorPage /> },

      /* ── Auth ───────────────────────────────────────────────────────────── */
      { path: '/login',   element: <LoginPage /> },

      // Register is removed from nav/UI — redirect to login instead of 404
      { path: '/register', element: <Navigate to="/login" replace /> },

      { path: '/profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '/forgot-password',        element: <ForgotPasswordPage /> },
      { path: '/reset-password/:token',  element: <ResetPasswordPage /> },

      // Google OAuth callback (must be inside AuthProvider)
      { path: '/auth/callback', element: <GoogleCallbackPage /> },

      /* ── Newsletter email links (still needed for transactional emails) ── */
      { path: '/newsletter/confirm/:token',     element: <NewsletterConfirmPage /> },
      { path: '/newsletter/unsubscribe/:token', element: <NewsletterUnsubscribePage /> },
      // NOTE: /newsletter standalone page intentionally removed from nav.
      // Keep the route so existing links don't 404 — redirect to home.
      // Delete this line only after any existing newsletter signup emails expire.

      /* ── Reader actions ─────────────────────────────────────────────────── */
      { path: '/support',     element: <SupportPage /> },
      { path: '/submissions', element: <SubmissionsPage /> },
      { path: '/write-for-us', element: <SubmissionsPage /> },
      { path: '/contact',     element: <ContactPage /> },

      /* ── About & policy ─────────────────────────────────────────────────── */
      { path: '/about', element: <AboutPage /> },

      // /team was in the old nav — now removed from nav/footer.
      // Redirect to /about so old inbound links don't 404.
      { path: '/team', element: <Navigate to="/about" replace /> },

      // These pages still exist (legal content) but are removed from nav/footer.
      // Keep routes so direct links / bookmarks still work.
      { path: '/editorial-policy', element: <EditorialPolicyPage /> },
      { path: '/funding',          element: <FundingPage /> },
      { path: '/corrections',      element: <CorrectionsPage /> },
      { path: '/grievance',        element: <GrievancePage /> },

      /* ── Legal ──────────────────────────────────────────────────────────── */
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms',   element: <TermsPage /> },

      /* ── Section aliases ────────────────────────────────────────────────── */
      { path: '/in-their-words', element: <CategoryPage fixedSlug="in-their-words" /> },
      { path: '/series',         element: <CategoryPage fixedSlug="series" /> },

      // /verified removed from nav per client — redirect to home to avoid 404
      { path: '/verified', element: <Navigate to="/" replace /> },

      /* ── 404 ────────────────────────────────────────────────────────────── */
      { path: '/404', element: <NotFoundPage /> },
      { path: '*',    element: <Navigate to="/404" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'DM Sans, system-ui, sans-serif',
            fontSize:   '13px',
            borderRadius: '0px',
            border:     '1px solid #e2e8f0',
          },
          success: {
            iconTheme: { primary: '#122837', secondary: '#FBFC09' },
          },
          error: {
            iconTheme: { primary: '#c8392b', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  );
}