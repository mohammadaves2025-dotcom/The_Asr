import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, Star } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService, categoriesService } from '../services/articles';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { formatDate } from '../utils/helpers';
import type { Article } from '../types';

// ── Breaking Ticker (inline homepage version) ──────────────────────────────────
// NOTE: the standalone BreakingTicker component (components/home/BreakingTicker.tsx)
// is used in Layout. This inline version is only used if layout doesn't include it.
function BreakingTicker({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  const text = articles.map((a) => a.title).join('   ·   ');
  return (
    // Consistent with the updated standalone component: bg-brand-red, white text
    <div className="bg-brand-red text-white flex items-stretch overflow-hidden border-b border-white/10">
      <div className="flex-shrink-0 bg-brand-navy px-4 flex items-center gap-2 min-w-[90px]">
        <Zap size={11} className="text-brand-yellow" fill="currentColor" />
        <span className="text-[9px] font-black tracking-[3px] uppercase text-brand-yellow whitespace-nowrap">
          Breaking
        </span>
      </div>
      <div className="flex-1 overflow-hidden py-2.5 relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-red to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-red to-transparent z-10" />
        <div className="whitespace-nowrap inline-flex items-center ticker-animate text-[13px] font-sans font-medium text-white">
          {text}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>
    </div>
  );
}

// ── Section Header ─────────────────────────────────────────────────────────────
function SectionHead({
  label,
  title,
  href,
  accent = '#c8392b',
}: {
  label?: string;
  title: string;
  href: string;
  accent?: string;
}) {
  return (
    <div
      className="flex items-end justify-between mb-5 pb-3"
      style={{ borderBottom: `2px solid ${accent}` }}
    >
      <div>
        {label && (
          <p
            className="text-[9px] font-black uppercase tracking-[3px] mb-1 font-sans"
            style={{ color: accent }}
          >
            {label}
          </p>
        )}
        <h2 className="text-xl font-serif font-bold text-ink">{title}</h2>
      </div>
      <Link
        to={href}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-muted hover:text-brand-navy transition-colors font-sans flex-shrink-0 mb-1"
      >
        More <ArrowRight size={11} />
      </Link>
    </div>
  );
}

// ── The Lead (Most Read) ───────────────────────────────────────────────────────
// Renamed from "Most Read" → "The Lead" per client instructions
function TheLead({ articles }: { articles: Article[] }) {
  return (
    <div className="border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-ink">
        <TrendingUp size={14} className="text-ink" />
        {/* Renamed from "Most Read" to "The Lead" */}
        <h2 className="text-sm font-serif font-bold text-ink">The Lead</h2>
      </div>
      <ol>
        {articles.slice(0, 5).map((art, i) => (
          <li
            key={art._id}
            className="group border-b border-gray-100 last:border-0 py-4 flex items-start gap-3"
          >
            <span className="text-[28px] font-serif font-black text-gray-100 leading-none flex-shrink-0 mt-0.5 w-8 text-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Link
                to={`/article/${art.slug}`}
                className="text-[13px] font-serif font-semibold text-ink line-clamp-3 group-hover:text-brand-navy transition-colors block leading-snug"
              >
                {art.title}
              </Link>
              <p className="text-[10px] text-ink-muted mt-1.5 font-sans">{art.readTime}m read</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Donate Card ───────────────────────────────────────────────────────────────
function DonateCard() {
  return (
    <div className="border-2 border-brand-navy p-5">
      <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-2 font-sans">
        Support Independent Journalism
      </p>
      <p className="font-serif font-bold text-[15px] text-ink mb-4 leading-snug">
        Fearless reporting needs your support.
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
        Donate Now →
      </Link>
    </div>
  );
}

// ── Opinion Card ──────────────────────────────────────────────────────────────
function OpinionCard({ article }: { article: Article }) {
  const authorName =
    article.isGuestAuthor && article.guestAuthorName
      ? article.guestAuthorName
      : article.author?.name ?? 'The Orbis Journal';
  return (
    <div className="group py-5 border-b border-gray-100 last:border-0 flex gap-4">
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[9px] font-black uppercase tracking-[1.5px] bg-brand-navy/10 text-brand-navy px-2 py-0.5 mb-2">
          Opinion
        </span>
        <Link
          to={`/article/${article.slug}`}
          className="block font-serif font-bold text-[15px] text-ink line-clamp-2 leading-snug group-hover:text-brand-navy transition-colors mb-2"
        >
          {article.title}
        </Link>
        <div className="flex items-center gap-2">
          {article.author?.avatar ? (
            <img
              src={article.author.avatar}
              alt={authorName}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[9px]">{authorName[0]}</span>
            </div>
          )}
          <span className="text-[11px] text-ink-secondary font-sans font-medium">{authorName}</span>
        </div>
      </div>
      {article.featuredImage?.url && (
        <Link to={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="w-20 h-20 overflow-hidden bg-gray-100">
            <img
              src={article.featuredImage.url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      )}
    </div>
  );
}

// ── The Orbis Original (was "Stories That Mattered" / "Impact Journalism") ─────
// Renamed per client: label "The Orbis Original", section title kept descriptive
function TheOrbisOriginal({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;

  const ACCENTS = [
    { bg: 'bg-brand-navy',  text: 'text-brand-yellow', border: 'border-brand-navy'  },
    { bg: 'bg-brand-red',   text: 'text-white',         border: 'border-brand-red'   },
    { bg: 'bg-amber-700',   text: 'text-white',         border: 'border-amber-700'   },
    { bg: 'bg-emerald-800', text: 'text-white',         border: 'border-emerald-800' },
  ];

  return (
    <section className="my-14">
      <div className="border-y-2 border-ink py-5 mb-8 flex flex-col sm:flex-row sm:items-end gap-3 sm:justify-between">
        <div>
          {/* Renamed label from "Impact Journalism" to "The Orbis Original" */}
          <p className="text-[9px] font-black uppercase tracking-[4px] text-brand-red mb-1.5 font-sans">
            The Orbis Original
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-ink leading-tight">
            Stories That Mattered
          </h2>
          {/* Updated description per client "The Orbis Special" copy */}
          <p className="text-[12px] text-ink-muted font-sans mt-1.5 max-w-md leading-relaxed">
            We bring powerful stories from across India, highlighting the lives and struggles of
            individuals whose experiences expose injustice, inspire reflection, and demand attention.
          </p>
        </div>
        <Link
          to="/category/investigation"
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[2px] text-ink-muted hover:text-brand-navy transition-colors font-sans flex-shrink-0"
        >
          All Investigations <ArrowRight size={11} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border border-gray-200">
        {articles.slice(0, 4).map((art, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const authorName =
            art.isGuestAuthor && art.guestAuthorName
              ? art.guestAuthorName
              : art.author?.name ?? 'The Orbis Journal';

          return (
            <div
              key={art._id}
              className="group relative flex flex-col border-b sm:border-b-0 sm:border-r border-gray-200 last:border-r-0"
            >
              <div
                className={`absolute top-0 left-0 w-8 h-8 ${accent.bg} flex items-center justify-center z-10`}
              >
                <span className={`text-[11px] font-black font-sans ${accent.text}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {art.featuredImage?.url ? (
                <Link
                  to={`/article/${art.slug}`}
                  className="block overflow-hidden bg-gray-100 aspect-[4/3]"
                >
                  <img
                    src={art.featuredImage.url}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </Link>
              ) : (
                <div className={`aspect-[4/3] ${accent.bg} opacity-10`} />
              )}

              <div className="flex flex-col flex-1 p-4 pt-3">
                <div className="mb-2 mt-1">
                  <span
                    className={`inline-block text-[8px] font-black uppercase tracking-[2px] px-2 py-0.5 border ${accent.border} ${accent.bg} ${accent.text}`}
                  >
                    {art.contentType === 'investigation'
                      ? 'Investigation'
                      : art.contentType === 'ground-report'
                      ? 'Ground Report'
                      : art.contentType === 'verified-report'
                      ? '✓ Verified'
                      : 'Must Read'}
                  </span>
                </div>

                <Link
                  to={`/article/${art.slug}`}
                  className="font-serif font-bold text-[14px] text-ink leading-snug line-clamp-3 group-hover:text-brand-navy transition-colors mb-2 block"
                >
                  {art.title}
                </Link>

                {(art.subtitle || art.excerpt) && (
                  <p className="text-[11px] text-ink-muted font-sans leading-relaxed line-clamp-2 mb-3 flex-1">
                    {(art.subtitle || art.excerpt).slice(0, 90)}
                    {(art.subtitle || art.excerpt).length > 90 ? '…' : ''}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {art.author?.avatar ? (
                      <img
                        src={art.author.avatar}
                        alt={authorName}
                        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-ink/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-bold text-ink">{authorName[0]}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-ink-muted font-sans truncate">{authorName}</span>
                  </div>
                  {art.publishedAt && (
                    <span className="text-[9px] text-ink-muted font-sans flex-shrink-0 ml-2">
                      {formatDate(art.publishedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-t-0 border-gray-200 bg-brand-navy/5 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-3">
          <Star size={14} className="text-brand-yellow flex-shrink-0" fill="currentColor" />
          <p className="text-[12px] text-ink-secondary font-sans leading-relaxed">
            These stories shaped policy, sparked legal action, or gave voice to communities ignored
            elsewhere.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function HomePageSkeleton() {
  return (
    <div className="bg-paper">
      <div className="container-site py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-gray-200 h-80 md:h-[480px]" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 w-16 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 grid md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-56" />
            ))}
          </div>
          <div className="lg:col-span-4 space-y-5">
            <div className="h-64 bg-gray-200" />
            <div className="h-40 bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const SITE_URL = import.meta.env.VITE_SITE_URL ?? 'https://theorbisjournal.in';

export default function HomePage() {
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'home'],
    queryFn: () => articlesService.getAll({ limit: 30, status: 'published', sort: '-publishedAt' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const articles: Article[]  = articlesData?.data?.data?.articles ?? [];
  const categories           = categoriesData?.data?.data?.categories ?? [];

  // ── SEO ─────────────────────────────────────────────────────────────────────
  useSeoMeta({
    title:       'The Orbis Journal — Independent Human Rights Journalism',
    description:
      'Independent, reader-funded journalism on human rights, minorities, and social justice in India and beyond.',
    url:  SITE_URL,
    type: 'website',
  });

  if (isLoading) return <HomePageSkeleton />;

  const breaking     = articles.filter((a) => a.isBreaking);
  const hero         = articles.find((a) => a.isFeatured) ?? articles[0];
  const sideStories  = articles.filter((a) => a._id !== hero?._id).slice(0, 4);
  const usedIds      = new Set([hero?._id, ...sideStories.map((a) => a._id)]);
  const latestGrid   = articles.filter((a) => !usedIds.has(a._id)).slice(0, 6);
  const usedIds2     = new Set([...usedIds, ...latestGrid.map((a) => a._id)]);
  const investigations = articles.filter((a) => a.contentType === 'investigation').slice(0, 4);
  const opinions     = articles.filter((a) => a.contentType === 'opinion').slice(0, 3);
  const moreGrid     = articles.filter((a) => !usedIds2.has(a._id)).slice(0, 6);
  const mostRead     = [...articles]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, 5);

  const mustReads = articles.filter((a) => a.isMustRead);
  const storiesThatMattered =
    mustReads.length >= 2
      ? mustReads.slice(0, 4)
      : [
          ...mustReads,
          ...articles
            .filter(
              (a) =>
                !mustReads.find((m) => m._id === a._id) &&
                (a.contentType === 'investigation' ||
                  a.contentType === 'ground-report' ||
                  a.contentType === 'verified-report')
            )
            .slice(0, 4 - mustReads.length),
        ].slice(0, 4);

  return (
    <div className="bg-paper min-h-screen">
      {breaking.length > 0 && <BreakingTicker articles={breaking} />}

      {/* Support bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-site flex items-center justify-between py-1.5">
          <p className="text-[10px] text-ink-muted font-sans hidden md:block">
            <span className="font-semibold text-ink">The Orbis Journal</span> · Independent,
            reader-funded journalism on human rights &amp; minorities
          </p>
          <Link
            to="/support"
            className="ml-auto text-[9px] font-black uppercase tracking-[2px] text-brand-red hover:text-brand-red-dark transition-colors font-sans"
          >
            Support Our Work →
          </Link>
        </div>
      </div>

      <div className="container-site py-7 md:py-10">

        {/* Hero */}
        {hero && (
          <section className="mb-10 border-b-2 border-ink pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
              <div className="lg:col-span-8">
                <ArticleCard article={hero} variant="hero" />
              </div>
              <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-ink lg:pl-6 pt-6 lg:pt-0">
                {/* Renamed "Editor's Picks" to "Features" per client */}
                <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-red mb-4">
                  Features
                </p>
                {sideStories.map((art) => (
                  <ArticleCard key={art._id} article={art} variant="text-only" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Main + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

          <main className="lg:col-span-8 space-y-12">

            {/* Just In (was "Latest") */}
            {latestGrid.length > 0 && (
              <section>
                {/* Renamed: label "Top Stories", title "Just In" (was "Latest") */}
                <SectionHead label="Top Stories" title="Just In" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {latestGrid.map((art) => (
                    <ArticleCard key={art._id} article={art} />
                  ))}
                </div>
              </section>
            )}

            {/* Investigations */}
            {investigations.length > 0 && (
              <section>
                <SectionHead
                  label="Deep Dive"
                  title="Investigations"
                  href="/category/investigation"
                  accent="#6d28d9"
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <ArticleCard article={investigations[0]} variant="featured-side" />
                  </div>
                  {investigations.slice(1, 3).map((art) => (
                    <ArticleCard key={art._id} article={art} />
                  ))}
                </div>
              </section>
            )}

            {/* Opinion */}
            {opinions.length > 0 && (
              <section>
                <SectionHead
                  label="Voices"
                  title="Opinion & Analysis"
                  href="/category/opinion"
                  accent="#0d1e29"
                />
                <div>
                  {opinions.map((art) => (
                    <OpinionCard key={art._id} article={art} />
                  ))}
                </div>
              </section>
            )}

            {/* The Orbis Original (was "Stories That Mattered" with "Impact Journalism" label) */}
            <TheOrbisOriginal articles={storiesThatMattered} />

            {/* More stories */}
            {moreGrid.length > 0 && (
              <section>
                <SectionHead title="More Stories" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {moreGrid.map((art) => (
                    <ArticleCard key={art._id} article={art} />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link to="/search" className="btn-secondary">
                    Load More Stories <ArrowRight size={13} />
                  </Link>
                </div>
              </section>
            )}

            {/* Category strips */}
            {categories.slice(0, 3).map((cat: any) => {
              const catArticles = articles
                .filter((a) => a.category?.slug === cat.slug)
                .slice(0, 3);
              if (catArticles.length < 2) return null;
              return (
                <section key={cat._id}>
                  <SectionHead
                    title={cat.name}
                    href={`/category/${cat.slug}`}
                    accent={cat.color ?? '#c8392b'}
                  />
                  <div className="grid md:grid-cols-3 gap-5">
                    {catArticles.map((art) => (
                      <ArticleCard key={art._id} article={art} />
                    ))}
                  </div>
                </section>
              );
            })}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            {/* The Lead (was "Most Read") */}
            {mostRead.length > 0 && <TheLead articles={mostRead} />}

            {/* Newsletter removed from sidebar per client instructions */}

            <DonateCard />

            {/* Follow Us — Telegram removed, LinkedIn added */}
            <div className="border border-gray-200 p-5">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-4 font-sans">
                Follow Us
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Twitter / X', href: '#' },
                  { name: 'Instagram',   href: '#' },
                  { name: 'YouTube',     href: '#' },
                  { name: 'Facebook',    href: '#' },
                  { name: 'LinkedIn',    href: '#' },
                  { name: 'WhatsApp',    href: '#' },
                ].map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center border border-gray-200 py-2.5 text-[10px] font-bold text-ink-muted hover:text-ink hover:border-gray-400 transition-all font-sans"
                  >
                    {s.name}
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}