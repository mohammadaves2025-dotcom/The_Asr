import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Clock,
  Calendar,
  Link2,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Send,
} from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import CommentsSection from '../components/article/CommentsSection';
import AISummary from '../components/article/AISummary';
import TranslationToggle from '../components/article/TranslationToggle';
import { articlesService } from '../services/articles';
import { useAuth } from '../context/AuthContext';
import { formatDateLong } from '../utils/helpers';
import { useSeoMeta } from '../hooks/useSeoMeta';
import api from '../services/api';
import type { Article, User } from '../types';

// ── Reading progress bar ───────────────────────────────────────────────────────
function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      ref.current.style.width =
        total > 0 ? `${Math.min((window.scrollY / total) * 100, 100)}%` : '0%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div ref={ref} id="reading-progress" style={{ width: '0%' }} />;
}

// ── Share bar — added Telegram, removed Eye/view count ────────────────────────
function ShareBar({ article }: { article: Article }) {
  const [copied, setCopied] = useState(false);
  const url  = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(article.title);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-5 border-y border-gray-200 my-8">
      <span className="text-[10px] font-black uppercase tracking-[2px] text-ink-muted mr-1 font-sans">
        Share
      </span>

      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-ink hover:text-white hover:border-ink transition-all font-sans"
      >
        Twitter / X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-sans"
      >
        Facebook
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${text}%20${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition-all font-sans"
      >
        WhatsApp
      </a>
      {/* Telegram — new */}
      <a
        href={`https://t.me/share/url?url=${url}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-[#2AABEE] hover:text-white hover:border-[#2AABEE] transition-all font-sans"
      >
        <Send size={11} /> Telegram
      </a>
      <button
        onClick={copyLink}
        className="ml-auto flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[11px] font-bold hover:bg-gray-100 transition-all font-sans"
      >
        <Link2 size={11} /> {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
}

// ── Author card ───────────────────────────────────────────────────────────────
function AuthorCard({ article }: { article: Article }) {
  const authorName =
    article.isGuestAuthor && article.guestAuthorName
      ? article.guestAuthorName
      : article.author?.name ?? 'The Orbis Journal';
  const authorBio = article.isGuestAuthor
    ? article.guestAuthorBio
    : article.author?.bio;

  return (
    <div className="border-t-2 border-ink pt-8 mt-10">
      <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-5 font-sans">
        About the Author
      </p>
      <div className="flex items-start gap-4">
        {article.author?.avatar ? (
          <img
            src={article.author.avatar}
            alt={authorName}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
            <span className="text-brand-yellow font-black text-lg">{authorName[0]}</span>
          </div>
        )}
        <div className="flex-1">
          {!article.isGuestAuthor ? (
            <Link
              to={`/author/${article.author?._id}`}
              className="font-serif font-bold text-lg text-ink hover:text-brand-navy transition-colors"
            >
              {authorName}
            </Link>
          ) : (
            <p className="font-serif font-bold text-lg text-ink">{authorName}</p>
          )}
          {article.author?.designation && (
            <p className="text-[11px] text-ink-muted font-sans mt-0.5">
              {article.author.designation}
            </p>
          )}
          {authorBio && (
            <p className="text-[13px] text-ink-secondary mt-2 leading-relaxed font-sans">
              {authorBio}
            </p>
          )}
          {!article.isGuestAuthor && article.author?._id && (
            <Link
              to={`/author/${article.author._id}`}
              className="text-[10px] font-black uppercase tracking-[2px] text-brand-red hover:underline font-sans mt-3 inline-block"
            >
              More by {authorName} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Bookmark hook ─────────────────────────────────────────────────────────────
type UserWithSaved = User & { savedArticles?: string[] };

function useBookmark(articleId: string) {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const isSaved =
    (user as UserWithSaved)?.savedArticles?.includes(articleId) ?? false;

  const mutation = useMutation({
    mutationFn: () => api.patch(`/users/me/saved/${articleId}`),
    onSuccess: () => {
      refreshUser();
    },
  });

  return {
    isSaved,
    toggle:         () => mutation.mutate(),
    isPending:      mutation.isPending,
    isAuthenticated,
  };
}

// ── Google Sign-In Prompt (page-load popup) ───────────────────────────────────
function GoogleSignInPrompt({
  onDismiss,
  returnTo,
}: {
  onDismiss: () => void;
  returnTo: string;
}) {
  const handleSignIn = () => {
    // Store where to return after OAuth
    sessionStorage.setItem('oauthReturnTo', returnTo);
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL ?? ''}/api/v1/auth/google`;
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-brand-navy text-white shadow-overlay border border-white/10 animate-fade-up">
      <div className="p-5">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 text-white/30 hover:text-white transition-colors text-lg leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
        <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-yellow mb-2 font-sans">
          The Orbis Journal
        </p>
        <p className="font-serif font-bold text-[15px] leading-snug mb-1">
          Join the conversation
        </p>
        <p className="text-white/50 text-[12px] font-sans mb-4 leading-relaxed">
          Sign in to comment, save articles, and support independent journalism.
        </p>
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-ink font-bold text-[12px] font-sans py-3 hover:bg-gray-100 transition-colors"
        >
          {/* Google "G" SVG — no external import needed */}
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://theorbisjournal.in';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();

  // ── Google Sign-In prompt state ───────────────────────────────────────────
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // ── Translation state — overrides displayed title/excerpt when active ─────
  const [translatedTitle,   setTranslatedTitle]   = useState<string | null>(null);
  const [translatedExcerpt, setTranslatedExcerpt] = useState<string | null>(null);

  const handleTranslate = (
    _lang: 'en' | 'hi' | 'ur',
    translation: { title: string; excerpt: string } | null
  ) => {
    setTranslatedTitle(translation?.title   ?? null);
    setTranslatedExcerpt(translation?.excerpt ?? null);
  };

  // Show the prompt after 6 seconds if not logged in — once per session
  useEffect(() => {
    if (isAuthenticated) return;
    const alreadyShown = sessionStorage.getItem('signInPromptShown');
    if (alreadyShown) return;
    const timer = setTimeout(() => {
      setShowSignInPrompt(true);
      sessionStorage.setItem('signInPromptShown', '1');
    }, 6000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () =>
      slug ? articlesService.getBySlug(slug) : Promise.reject('No slug'),
    enabled: !!slug,
  });

  useEffect(() => {
    if (slug) articlesService.incrementViews(slug).catch(() => {});
  }, [slug]);

  const article: Article | undefined = data?.data?.data?.article;
  const related: Article[] =
    (data?.data?.data as { related?: Article[] })?.related ?? [];

  const authorName =
    article?.isGuestAuthor && article?.guestAuthorName
      ? article.guestAuthorName
      : article?.author?.name ?? 'The Orbis Journal';

  const { isSaved, toggle: toggleBookmark, isPending: bookmarkPending } =
    useBookmark(article?._id ?? '');

  // ── SEO ───────────────────────────────────────────────────────────────────
  useSeoMeta(
    article
      ? {
          title:       article.seo?.metaTitle       ?? article.title,
          description: article.seo?.metaDescription ?? article.excerpt,
          image:       article.seo?.ogImage         ?? article.featuredImage?.url,
          url:         `${SITE_URL}/article/${article.slug}`,
          type:        'article',
          publishedAt: article.publishedAt,
          author:      authorName,
          section:     article.category?.name,
        }
      : {}
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <>
        <ReadingProgress />
        <div className="container-site py-16 max-w-3xl mx-auto space-y-5 animate-pulse">
          <div className="h-3 w-28 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-200 rounded" />
          <div className="h-7 w-2/3 bg-gray-200 rounded" />
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
          <div className="h-72 bg-gray-200 mt-8" />
          <div className="space-y-3 mt-8">
            {[100, 95, 90, 85, 75, 80].map((w, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !article) {
    return (
      <div className="container-site py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-ink mb-3">
          Article not found
        </h2>
        <p className="text-ink-muted mb-6 font-sans text-sm">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn-primary">
          ← Back to Home
        </Link>
      </div>
    );
  }

  const hasCorrections =
    article.corrections && article.corrections.length > 0;

  return (
    <>
      <ReadingProgress />

      {/* ── Google Sign-In Prompt ─────────────────────────────────────────── */}
      {showSignInPrompt && (
        <GoogleSignInPrompt
          onDismiss={() => setShowSignInPrompt(false)}
          returnTo={`/article/${article.slug}`}
        />
      )}

      <article className="bg-white">
        <div className="container-site py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* ── Article Body ─────────────────────────────────────────────── */}
            <div className="lg:col-span-8">

              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-[10px] text-ink-muted mb-6 font-sans">
                <Link
                  to="/"
                  className="hover:text-brand-navy transition-colors flex items-center gap-1"
                >
                  <ArrowLeft size={11} /> Home
                </Link>
                {article.category && (
                  <>
                    <span className="text-ink-faint">/</span>
                    <Link
                      to={`/category/${article.category.slug}`}
                      className="hover:text-brand-navy transition-colors capitalize"
                    >
                      {article.category.name}
                    </Link>
                  </>
                )}
              </nav>

              {/* Labels */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {article.isBreaking && (
                  <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-brand-red text-white">
                    Breaking
                  </span>
                )}
                {article.isVerified && (
                  <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-green-50 text-green-800">
                    ✓ Verified
                  </span>
                )}
                {article.isEditorsPick && (
                  <span className="text-[9px] font-black tracking-[2px] uppercase px-2 py-1 bg-brand-yellow text-brand-navy">
                    Features
                  </span>
                )}
                {article.category && (
                  <Link
                    to={`/category/${article.category.slug}`}
                    className="text-[9px] font-black tracking-[2px] uppercase text-brand-red hover:underline font-sans"
                  >
                    {article.category.name}
                  </Link>
                )}
              </div>

              {/* Language toggle — EN / हिन्दी / اُردُو */}
              <TranslationToggle
                originalTitle={article.title}
                originalExcept={article.excerpt}
                articleSlug={article.slug}
                onTranslate={handleTranslate}
              />

              {/* Title — shows translated version when active */}
              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-ink leading-tight mb-4">
                {translatedTitle ?? article.title}
              </h1>

              {/* Sub-headline — bold as per client (font-semibold + slightly larger) */}
              {(translatedExcerpt ?? article.subtitle) && (
                <p className="text-lg md:text-xl text-ink-secondary font-sans leading-relaxed font-semibold mb-6">
                  {translatedExcerpt ?? article.subtitle}
                </p>
              )}

              {/* Meta bar — view count removed per client */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-4 border-y border-gray-200 mb-8">
                <div className="flex items-center gap-2.5">
                  {article.author?.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={authorName}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-yellow font-bold text-[12px]">
                        {authorName[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    {!article.isGuestAuthor && article.author?._id ? (
                      <Link
                        to={`/author/${article.author._id}`}
                        className="text-[13px] font-semibold text-ink hover:text-brand-navy transition-colors font-sans block"
                      >
                        {authorName}
                      </Link>
                    ) : (
                      <span className="text-[13px] font-semibold text-ink font-sans">
                        {authorName}
                      </span>
                    )}
                    {article.author?.designation && (
                      <span className="text-[10px] text-ink-muted font-sans">
                        {article.author.designation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-ink-muted font-sans">
                  <Calendar size={11} />
                  {formatDateLong(article.publishedAt ?? article.createdAt)}
                </div>

                {article.readTime > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-muted font-sans">
                    <Clock size={11} /> {article.readTime} min read
                  </div>
                )}

                {/* View count REMOVED per client instruction */}

                {/* Bookmark */}
                {isAuthenticated && (
                  <button
                    onClick={toggleBookmark}
                    disabled={bookmarkPending}
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-ink-muted hover:text-brand-navy transition-colors disabled:opacity-50 font-sans"
                    title={isSaved ? 'Remove bookmark' : 'Save article'}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck size={14} className="text-brand-navy" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={14} /> Save
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Corrections banner */}
              {hasCorrections && (
                <div className="bg-amber-50 border border-amber-200 px-4 py-3 mb-6 flex items-start gap-2">
                  <AlertTriangle
                    size={14}
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[1.5px] text-amber-800 mb-1 font-sans">
                      Correction
                    </p>
                    {article.corrections!.map((c, i) => (
                      <p key={i} className="text-[12px] text-amber-900 font-sans">
                        {c.note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Image */}
              {article.featuredImage?.url && (
                <figure className="mb-8 -mx-4 md:mx-0">
                  <img
                    src={article.featuredImage.url}
                    alt={article.featuredImage.alt ?? article.title}
                    className="w-full max-h-[520px] object-cover"
                  />
                  {(article.featuredImage.caption ||
                    article.featuredImage.credit) && (
                    <figcaption className="text-[11px] text-ink-muted mt-2 px-4 md:px-0 font-sans">
                      {article.featuredImage.caption}
                      {article.featuredImage.credit && (
                        <span className="ml-1 italic">
                          · {article.featuredImage.credit}
                        </span>
                      )}
                    </figcaption>
                  )}
                </figure>
              )}

              {/* Series badge */}
              {article.series && (
                <div className="flex items-center gap-3 mb-6 p-4 bg-surface-secondary border-l-4 border-brand-navy">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[2px] text-ink-muted font-sans">
                      Part {article.seriesPart} of a series
                    </p>
                    <p className="text-[13px] font-serif font-semibold text-ink">
                      {article.series}
                    </p>
                  </div>
                </div>
              )}

              {/* AI Summary — "Read in 30 seconds" */}
              {article.body && (
                <AISummary
                  title={article.title}
                  excerpt={article.excerpt}
                  body={article.body}
                  slug={article.slug}
                />
              )}

              {/* Body */}
              {article.body ? (
                <div
                  className="prose-article"
                  dangerouslySetInnerHTML={{ __html: article.body }}
                />
              ) : (
                <div className="prose-article">
                  <p>{article.excerpt}</p>
                </div>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-10">
                  {article.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tag/${encodeURIComponent(tag)}`}
                      className="text-[10px] font-bold uppercase tracking-[1.5px] px-3 py-1.5 border border-gray-200 text-ink-muted hover:bg-ink hover:text-white hover:border-ink transition-all font-sans"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Share bar */}
              <ShareBar article={article} />

              {/* Author card */}
              <AuthorCard article={article} />

              {/* Newsletter CTA removed per client instruction */}

              {/* Comments — with sign-in gate (handled inside CommentsSection) */}
              <CommentsSection articleId={article._id} />
            </div>

            {/* ── Sidebar ──────────────────────────────────────────────────── */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">

                {/* Support */}
                <div className="border-2 border-brand-navy p-5">
                  <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-2 font-sans">
                    Support The Orbis Journal
                  </p>
                  <p className="font-serif font-bold text-[15px] text-ink mb-4 leading-snug">
                    Help us publish more journalism like this.
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {['₹200', '₹500', '₹1000', '₹2500'].map((a) => (
                      <button
                        key={a}
                        className="border border-gray-200 text-ink text-[11px] font-bold py-2 hover:bg-brand-navy hover:text-brand-yellow hover:border-brand-navy transition-all font-sans"
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  <Link
                    to="/support"
                    className="block text-center bg-brand-navy text-brand-yellow font-black text-[10px] uppercase tracking-[2px] py-3 hover:bg-brand-navy-dark transition-colors font-sans"
                  >
                    Donate →
                  </Link>
                </div>

                {/* Related articles — horizontal layout (thumbnail left, title right) */}
                {related.length > 0 && (
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-4 border-b-2 border-ink pb-3 font-sans">
                      Related Stories
                    </p>
                    <div>
                      {related.slice(0, 5).map((art) => (
                        <ArticleCard
                          key={art._id}
                          article={art}
                          variant="horizontal"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter removed from sidebar per client instruction */}
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}