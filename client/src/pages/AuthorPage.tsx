import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
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
      className="flex items-center gap-2 px-3 py-2 border border-white/20 text-white/60 hover:text-white hover:border-white/60 transition-all text-[11px] font-sans font-bold uppercase tracking-[1px]"
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
      icon: <Twitter size={13} />,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      icon: <Instagram size={13} />,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      icon: <Facebook size={13} />,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: <Linkedin size={13} />,
    },
    {
      key: 'youtube',
      label: 'YouTube',
      icon: <Youtube size={13} />,
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
  const isStaff = ['editor', 'admin', 'superadmin'].includes(author.role);

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
                  ? 'Guest Contributor'
                  : 'Author'}
              </p>

              {/* Name + verified badge */}
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
                  {author.name}
                </h1>
                {/* Blue verified badge for staff */}
                {isStaff && (
                  <BadgeCheck
                    size={26}
                    className="text-blue-400 flex-shrink-0"
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                )}
                {/* Guest contributor label */}
                {isContributor && (
                  <span className="text-[9px] font-black uppercase tracking-[2px] px-2 py-1 border border-white/25 text-white/50">
                    Guest
                  </span>
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
          Articles by {author.name}
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