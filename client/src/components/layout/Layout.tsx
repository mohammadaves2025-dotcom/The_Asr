import { Outlet, ScrollRestoration } from 'react-router-dom';
import { useEffect, useState, Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';

// ── Route-level loading fallback ─────────────────────────────────────────────
// Shown only inside <main>, while a lazy-loaded page chunk is fetched — the
// Header/Footer chrome is already visible immediately since only the page
// content itself is code-split. Small skeleton bar, not a full-page blocker.
function PageFallback() {
  return (
    <div className="container-site py-16 flex justify-center">
      <div className="w-6 h-6 border-2 border-brand-navy/20 border-t-brand-navy rounded-full animate-spin" />
    </div>
  );
}


// ── Browser Notification Permission Popup ─────────────────────────────────────
function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show if browser supports notifications, permission not yet decided,
    // and user hasn't dismissed it this session
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    const dismissed = sessionStorage.getItem('notifPromptDismissed');
    if (dismissed) return;

    // Show after 8 seconds
    const timer = setTimeout(() => setShow(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleAllow = () => {
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        new Notification('The Orbis Journal', {
          body: "You'll now receive breaking news alerts.",
          icon: '/favicon.ico',
        });
      }
    });
    setShow(false);
    sessionStorage.setItem('notifPromptDismissed', '1');
  };

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('notifPromptDismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl animate-fade-up p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-serif font-bold text-ink leading-snug">
            Stay informed with breaking news
          </p>
          <p className="text-[11px] text-ink-muted font-sans mt-1 leading-relaxed">
            Get notified when The Orbis Journal publishes a breaking story.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-ink-faint hover:text-ink transition-colors text-lg leading-none flex-shrink-0"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAllow}
          className="flex-1 bg-brand-navy text-brand-yellow text-[11px] font-black uppercase tracking-[1.5px] py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors font-sans"
        >
          Allow
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 border border-gray-200 text-ink-muted text-[11px] font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-sans"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <NotificationPrompt />
      <ScrollRestoration />
    </div>
  );
}