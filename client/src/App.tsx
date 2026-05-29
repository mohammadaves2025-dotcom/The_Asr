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
import RegisterPage              from './pages/RegisterPage';
import ProfilePage               from './pages/ProfilePage';
import SupportPage               from './pages/SupportPage';
import NewsletterPage            from './pages/NewsletterPage';
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

// New pages
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
      /* Main */
      { path: '/', element: <HomePage /> },
      { path: '/article/:slug', element: <ArticlePage /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/tag/:tag', element: <TagPage /> },
      { path: '/author/:id', element: <AuthorPage /> },

      /* Auth */
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password/:token', element: <ResetPasswordPage /> },

      /* Google OAuth callback — no Layout chrome needed but must be inside AuthProvider */
      { path: '/auth/callback', element: <GoogleCallbackPage /> },

      /* Newsletter email links */
      { path: '/newsletter/confirm/:token', element: <NewsletterConfirmPage /> },
      { path: '/newsletter/unsubscribe/:token', element: <NewsletterUnsubscribePage /> },

      /* Reader actions */
      { path: '/support', element: <SupportPage /> },
      { path: '/newsletter', element: <NewsletterPage /> },
      { path: '/submissions', element: <SubmissionsPage /> },
      { path: '/write-for-us', element: <SubmissionsPage /> },
      { path: '/contact', element: <ContactPage /> },

      /* About */
      { path: '/about', element: <AboutPage /> },
      { path: '/team', element: <AboutPage /> },
      { path: '/editorial-policy', element: <EditorialPolicyPage /> },
      { path: '/funding', element: <FundingPage /> },
      { path: '/corrections', element: <CorrectionsPage /> },
      { path: '/grievance', element: <GrievancePage /> },

      /* Legal */
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },

      /* Aliases — pass fixedSlug so CategoryPage doesn't get an empty useParams */
      { path: '/in-their-words', element: <CategoryPage fixedSlug="in-their-words" /> },
      { path: '/verified', element: <CategoryPage fixedSlug="verified" /> },
      { path: '/series', element: <CategoryPage fixedSlug="series" /> },

      /* 404 */
      { path: '/404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
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
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            borderRadius: '0px',
            border: '1px solid #e2e8f0',
          },
          success: {
            iconTheme: { primary: '#122837', secondary: '#FBFC09' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
