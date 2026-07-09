// client/src/App.tsx
// Changes (Step 11 — route cleanup):
//   - /register → redirects to /login (Register removed from UI per client)
//   - /team → redirects to /about (Our Team removed from nav per client)
//   - /verified alias removed (Verified section removed from nav per client)
//   - /newsletter page kept ONLY for the email confirm/unsubscribe links
//   - /series alias kept (still a valid content format)
//   - All page files still exist on disk — just no longer linked from nav/footer

import { lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
// ── HomePage stays a regular (eager) import — it's the landing page for most
// visits, so there's no benefit to code-splitting it; splitting it would just
// add an extra network round-trip for the most common case.
// Every other page is lazy-loaded: previously ALL of these were imported
// eagerly, meaning a visitor to just "/" had to download the JS for every
// single page (login, profile, all legal pages, admin-adjacent pages, etc.)
// before React could even mount HomePage. This was a big part of the blank
// screen on first load.
import HomePage                  from './pages/HomePage';
const ArticlePage               = lazy(() => import('./pages/ArticlePage'));
const CategoryPage              = lazy(() => import('./pages/CategoryPage'));
const FormatPage                = lazy(() => import('./pages/FormatPage'));
const SearchPage                = lazy(() => import('./pages/SearchPage'));
const TagPage                   = lazy(() => import('./pages/TagPage'));
const AuthorPage                = lazy(() => import('./pages/AuthorPage'));
const LoginPage                 = lazy(() => import('./pages/LoginPage'));
const ProfilePage               = lazy(() => import('./pages/ProfilePage'));
const SupportPage               = lazy(() => import('./pages/SupportPage'));
const SubmissionsPage           = lazy(() => import('./pages/SubmissionsPage'));
const AboutPage                 = lazy(() => import('./pages/AboutPage'));
const ContactPage               = lazy(() => import('./pages/ContactPage'));
const EditorialPolicyPage       = lazy(() => import('./pages/EditorialPolicyPage'));
const FundingPage               = lazy(() => import('./pages/FundingPage'));
const CorrectionsPage           = lazy(() => import('./pages/CorrectionsPage'));
const PrivacyPage               = lazy(() => import('./pages/PrivacyPage'));
const TermsPage                 = lazy(() => import('./pages/TermsPage'));
const GrievancePage             = lazy(() => import('./pages/GrievancePage'));
const NotFoundPage              = lazy(() => import('./pages/NotFoundPage'));

// Guards — kept eager, it's tiny and needed immediately for /profile
import ProtectedRoute            from './components/common/ProtectedRoute';

// OAuth & password reset
const GoogleCallbackPage        = lazy(() => import('./pages/GoogleCallbackPage'));
const ForgotPasswordPage        = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage         = lazy(() => import('./pages/ResetPasswordPage'));
const NewsletterConfirmPage     = lazy(() => import('./pages/NewsletterConfirmPage'));
const NewsletterUnsubscribePage = lazy(() => import('./pages/NewsletterUnsubscribePage'));

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
      { path: '/format/:type',   element: <FormatPage /> },
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