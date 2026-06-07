import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Globe,
  BadgeCheck,
} from 'lucide-react';
import api from '../services/api';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService } from '../services/articles';
import { formatDate } from '../utils/helpers';

// ── Social link button ────────────────────────────────────────────────────────
function SocialLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="flex items-center gap-2 px-3 py-2 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/60 transition-all text-[11px] font-sans font-bold uppercase tracking-[1px]"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </a>
  );
}

// ── Social links row — only renders links that exist ─────────────────────────
function SocialLinks({ socialLinks }: { socialLinks?: Record<string, string> }) {
  if (!socialLinks) return null;

  const links = [
    {
      key: 'twitter',
      label: 'Twitter / X',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
        </svg>
      ),
    },
    {
      key: 'website',
      label: 'Website',
      icon: <Globe size={13} />,
    },
  ].filter((l) => socialLinks[l.key]);

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-5">
      {links.map((l) => (
        <SocialLink
          key={l.key}
          href={socialLinks[l.key]}
          label={l.label}
          icon={l.icon}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AuthorPage() {
  const { id } = useParams<{ id: string }>();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['author', id],
    queryFn: () => api.get(`/users/${id}/profile`),
    enabled: !!id,
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['author-articles', id],
    queryFn: () =>
      articlesService.getAll({
        author: id,
        status: 'published',
        limit: 20,
        sort: '-publishedAt',
      }),
    enabled: !!id,
  });

  const author   = profileData?.data?.data?.user;
  const articles = articlesData?.data?.data?.articles ?? [];

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="bg-brand-navy min-h-[320px] animate-pulse">
        <div className="container-site py-16">
          <div className="flex gap-6">
            <div className="w-28 h-28 rounded-full bg-white/10 flex-shrink-0" />
            <div className="flex-1 space-y-4 pt-2">
              <div className="h-8 bg-white/10 w-56 rounded" />
              <div className="h-4 bg-white/10 w-36 rounded" />
              <div className="h-4 bg-white/10 rounded" />
              <div className="h-4 bg-white/10 w-3/4 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container-site py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-ink mb-3">Author not found</h2>
        <Link to="/" className="btn-secondary">
          Go Home
        </Link>
      </div>
    );
  }

  // Is this a guest contributor vs. a staff writer?
  const isContributor = author.role === 'contributor';
  const isStaff = ['editor', 'admin', 'superadmin'].includes(author.role);;

  return (
    <div>
      {/* ── Author header ────────────────────────────────────────────────────── */}
      <div className="bg-brand-navy text-white">
        <div className="container-site py-12 md:py-16">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-6 text-[10px] font-sans text-white/40">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight size={10} />
            <span className="text-white/70">{author.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-6">
            {/* Avatar */}
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ring-brand-yellow flex-shrink-0"
              />
            ) : (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-brand-yellow flex items-center justify-center flex-shrink-0">
                <span className="text-brand-navy text-4xl font-serif font-black">
                  {author.name[0]}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Role label */}
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-2 font-sans">
                {isStaff
                  ? 'Staff Writer'
                  : isContributor
                  ? 'Contributing Writer'
                  : 'Author'}
              </p>

              {/* Name + verified badge */}
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                  {author.name}
                </h1>
                {/* Blue verified badge for staff */}
                {(isStaff || isContributor) && (
                  <BadgeCheck
                    size={26}
                    className="text-blue-400 flex-shrink-0"
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                )}
              </div>

              {/* Designation */}
              {author.designation && (
                <p className="text-white/60 text-[13px] font-sans mb-3">
                  {author.designation}
                </p>
              )}

              {/* Bio */}
              {author.bio && (
                <p className="text-white/70 font-sans text-sm leading-relaxed max-w-2xl">
                  {author.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-white/40 text-xs font-sans">
                  {articles.length} article{articles.length !== 1 ? 's' : ''} published
                </span>
                {author.createdAt && (
                  <span className="text-white/30 text-xs font-sans">
                    · Joined {formatDate(author.createdAt)}
                  </span>
                )}
              </div>

              {/* Social links */}
              <SocialLinks socialLinks={author.socialLinks} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Articles by this author ──────────────────────────────────────────── */}
      <div className="container-site py-10">
        <h2 className="text-xl font-serif font-bold text-ink mb-6 pb-3 border-b-2 border-brand-navy">
          Stories by {author.name}
        </h2>

        {articlesLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 py-5 border-b border-gray-100">
                <div className="w-24 h-24 bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 bg-gray-200 w-20 rounded" />
                  <div className="h-5 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 w-3/4 rounded" />
                  <div className="h-3 bg-gray-200 w-28 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-ink-muted py-16 text-center font-sans">
            No articles published yet.
          </p>
        ) : (
          // Horizontal variant: thumbnail LEFT, headline RIGHT — matches Observer Post layout
          <div>
            {articles.map((art) => (
              <ArticleCard key={art._id} article={art} variant="horizontal" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}