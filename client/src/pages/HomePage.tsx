import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import BreakingTicker from '../components/home/BreakingTicker';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService, categoriesService } from '../services/articles';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { formatDate, resolveAuthorName } from '../utils/helpers';
import type { Article } from '../types';

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
            className="text-[12px] font-black uppercase tracking-[3px] mb-1 font-sans"
            style={{ color: accent }}
          >
            {label}
          </p>
        )}
        <h2 className="text-3xl font-serif font-bold text-ink italic">{title}</h2>
      </div>
      <Link
        to={href}
        className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted hover:text-brand-navy transition-colors font-sans flex-shrink-0 mb-1"
      >
        More <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Most Read (sidebar) ────────────────────────────────────────────────────────
function MostRead({ articles }: { articles: Article[] }) {
  return (
    <div className="border border-gray-200 p-5 rounded-xl">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-ink">
        <TrendingUp size={14} className="text-ink" />
        <h2 className="text-sm font-serif font-bold text-ink">Most Read</h2>
      </div>
      <ol>
        {articles.slice(0, 5).map((art) => (
          <li key={art._id} className="group border-b border-gray-100 last:border-0 py-4 flex items-start gap-3">
            <Link to={`/article/${art.slug}`} className="flex-shrink-0 block w-24 aspect-video rounded-lg overflow-hidden bg-gray-100">
              {art.featuredImage?.url ? (
                <img src={art.featuredImage.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-navy/20 to-brand-navy/5" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/article/${art.slug}`} className="text-[15px] font-serif font-semibold text-ink line-clamp-3 group-hover:text-brand-navy transition-colors block leading-snug">
                {art.title}
              </Link>
              <p className="text-[12px] text-ink-muted mt-1.5 font-sans">{art.readTime}m read</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Popular Stories (sidebar) ─────────────────────────────────────────────────
function PopularStories({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  return (
    <div className="border border-gray-200 p-5 rounded-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-brand-red">
        <h2 className="text-sm font-serif font-bold text-ink">Popular Stories</h2>
        <span className="text-[9px] font-black uppercase tracking-[2px] text-brand-red font-sans">This Week</span>
      </div>
      <ul className="space-y-4">
        {articles.map((art) => (
          <li key={art._id} className="group flex gap-3 items-start">
            <Link to={`/article/${art.slug}`} className="flex-shrink-0 block w-24 aspect-video rounded-lg overflow-hidden bg-gray-100">
              {art.featuredImage?.url ? (
                <img src={art.featuredImage.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-navy/20 to-brand-navy/5" />
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/article/${art.slug}`} className="text-[14px] font-serif font-semibold text-ink line-clamp-2 group-hover:text-brand-navy transition-colors block leading-snug">
                {art.title}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Donate Card ───────────────────────────────────────────────────────────────
function DonateCard() {
  return (
    <div className="rounded-xl overflow-hidden">
      <div className="bg-brand-yellow px-5 pt-5 pb-4">
        <p className="text-[11px] font-black uppercase tracking-[3px] text-brand-navy/60 mb-1.5 font-sans">
          Support Independent Journalism
        </p>
        <p className="font-serif font-bold text-[17px] text-brand-navy leading-snug">
          Fearless reporting needs your support.
        </p>
      </div>
      <div className="bg-brand-navy px-5 pt-4 pb-5">
        <p className="text-[13px] text-white/50 font-sans mb-4 leading-relaxed">
          Your contribution keeps our newsroom independent and our journalism free for everyone.
        </p>
        <Link to="/support" className="block text-center bg-brand-yellow text-brand-navy font-black text-[11px] uppercase tracking-[2px] py-3 rounded-lg hover:bg-yellow-300 transition-colors font-sans">
          Donate Now →
        </Link>
      </div>
    </div>
  );
}

// ── Opinion Card ──────────────────────────────────────────────────────────────
// Note: no "Opinion" chip here — ContentLabel in ArticleCard handles labelling.
// This component is used inside an Opinion section that already has a section header.
function OpinionCard({ article }: { article: Article }) {
  const authorName =
    article.isGuestAuthor && article.guestAuthorName
      ? article.guestAuthorName
      : resolveAuthorName(article.author?.name);
  return (
    <div className="group py-5 border-b border-gray-100 last:border-0 flex gap-4">
      <div className="flex-1 min-w-0">
        <Link to={`/article/${article.slug}`} className="block font-serif font-bold text-[17px] text-ink line-clamp-2 leading-snug group-hover:text-brand-navy transition-colors mb-2">
          {article.title}
        </Link>
        <div className="flex items-center gap-2">
          {article.author?.avatar ? (
            <img src={article.author.avatar} alt={authorName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[11px]">{authorName[0]}</span>
            </div>
          )}
          <span className="text-[13px] text-ink-secondary font-sans font-medium flex items-center gap-1">
            {authorName}
            {authorName === 'The Orbis Journal Desk' && (
              <span title="Verified" className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-blue-500 flex-shrink-0">
                <svg viewBox="0 0 24 24" width="7" height="7" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </span>
            )}
          </span>
        </div>
      </div>
      {article.featuredImage?.url && (
        <Link to={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="w-24 aspect-video overflow-hidden bg-gray-100 rounded-lg">
            <img src={article.featuredImage.url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        </Link>
      )}
    </div>
  );
}

// ── The Orbis Original ────────────────────────────────────────────────────────
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
          <p className="text-[12px] font-black uppercase tracking-[4px] text-brand-red mb-1.5 font-sans">The Orbis Original</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink leading-tight italic">Stories That Mattered</h2>
          <p className="text-[14px] text-ink-muted font-sans mt-1.5 max-w-md leading-relaxed">
            We bring powerful stories from across India, highlighting the lives and struggles of individuals whose experiences expose injustice, inspire reflection, and demand attention.
          </p>
        </div>
        <Link to="/search" className="flex items-center gap-1.5 text-[12px] font-black uppercase tracking-[2px] text-ink-muted hover:text-brand-navy transition-colors font-sans flex-shrink-0">
          All Stories <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {articles.slice(0, 4).map((art, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          const authorName =
            art.isGuestAuthor && art.guestAuthorName
              ? art.guestAuthorName
              : resolveAuthorName(art.author?.name);

          return (
            <div key={art._id} className="group relative flex flex-col border border-gray-200 rounded-xl overflow-hidden">
              <div className={`absolute top-0 left-0 w-8 h-8 ${accent.bg} flex items-center justify-center z-10`}>
                <span className={`text-[12px] font-black font-sans ${accent.text}`}>{String(i + 1).padStart(2, '0')}</span>
              </div>

              {art.featuredImage?.url ? (
                <Link to={`/article/${art.slug}`} className="block overflow-hidden bg-gray-100 aspect-[4/3]">
                  <img src={art.featuredImage.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </Link>
              ) : (
                <div className={`aspect-[4/3] ${accent.bg} opacity-10`} />
              )}

              <div className="flex flex-col flex-1 p-4 pt-3">
                <div className="mb-2 mt-1">
                  <span className={`inline-block text-[11px] font-black uppercase tracking-[2px] px-2 py-0.5 border ${accent.border} ${accent.bg} ${accent.text}`}>
                    {art.contentType === 'investigation' ? 'Investigation'
                      : art.contentType === 'ground-report' ? 'Ground Report'
                      : art.contentType === 'verified-report' ? '✓ Verified'
                      : 'Must Read'}
                  </span>
                </div>

                <Link to={`/article/${art.slug}`} className="font-serif font-bold text-[16px] text-ink leading-snug line-clamp-3 group-hover:text-brand-navy transition-colors mb-2 block">
                  {art.title}
                </Link>

                {(art.subtitle || art.excerpt) && (
                  <p className="text-[13px] text-ink-muted font-sans leading-relaxed line-clamp-2 mb-3 flex-1">
                    {(art.subtitle || art.excerpt).slice(0, 90)}
                    {(art.subtitle || art.excerpt).length > 90 ? '…' : ''}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {art.author?.avatar ? (
                      <img src={art.author.avatar} alt={authorName} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-ink/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-ink">{authorName[0]}</span>
                      </div>
                    )}
                    <span className="text-[12px] text-ink-muted font-sans truncate">{authorName}</span>
                  </div>
                  {art.publishedAt && (
                    <span className="text-[12px] text-ink-muted font-sans flex-shrink-0 ml-2">{formatDate(art.publishedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
          <div className="lg:col-span-2 bg-gray-200 h-80 md:h-[480px] rounded-xl" />
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
            {[1, 2, 3].map((i) => (<div key={i} className="bg-gray-200 h-56 rounded-xl" />))}
          </div>
          <div className="lg:col-span-4 space-y-5">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-40 bg-gray-200 rounded-xl" />
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
    refetchInterval: 2.5 * 60 * 1000,
  });

  // Dedicated Most Read query — sorted by views descending
  const { data: mostReadData } = useQuery({
    queryKey: ['articles', 'most-read'],
    queryFn: () => articlesService.getAll({ limit: 8, status: 'published', sort: '-views' }),
    staleTime: 10 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const articles: Article[]  = articlesData?.data?.data?.articles ?? [];
  const mostReadArticles: Article[] = mostReadData?.data?.data?.articles ?? [];
  const popularArticles: Article[]  = mostReadArticles.slice(5, 8);
  const categories           = categoriesData?.data?.data?.categories ?? [];

  useSeoMeta({
    title:       'The Orbis Journal — Independent Human Rights Journalism',
    description: 'Independent, reader-funded journalism on human rights, minorities, and social justice in India and beyond.',
    url:  SITE_URL,
    type: 'website',
  });

  if (isLoading) return <HomePageSkeleton />;

  const breaking    = articles.filter((a) => a.isBreaking);
  const hero        = articles.find((a) => a.isFeatured) ?? articles[0];
  const sideStories = articles.filter((a) => a._id !== hero?._id).slice(0, 4);
  const usedIds     = new Set([hero?._id, ...sideStories.map((a) => a._id)]);
  const latestGrid  = articles.filter((a) => !usedIds.has(a._id)).slice(0, 6);
  const usedIds2    = new Set([...usedIds, ...latestGrid.map((a) => a._id)]);
  const opinions    = articles.filter((a) => a.contentType === 'opinion').slice(0, 3);
  const editorsPick = articles.filter((a) => a.isEditorsPick).slice(0, 3);
  const moreGrid    = articles.filter((a) => !usedIds2.has(a._id)).slice(0, 6);

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

  // Through the Lens — photo-essays only, no fallback
  const photoEssays  = articles.filter((a) => a.contentType === 'photo-essay' || (a.tags && a.tags.includes('photo')));
  const lensArticles = photoEssays.slice(0, 3);

  return (
    <div className="bg-paper min-h-screen">
      {breaking.length > 0 && <BreakingTicker items={breaking} />}

      <div className="container-site py-7 md:py-10">

        {/* Hero */}
        {hero && (
          <section className="mb-16  pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
              <div className="lg:col-span-8">
                <ArticleCard article={hero} variant="hero" />
              </div>
              <div className="lg:col-span-4 lg:border-t-0 lg:border-l-2 border-ink lg:pl-6 pt-6 lg:pt-0">
                <p className="text-[15px] font-black uppercase tracking-[3px] text-brand-red mb-4">Features</p>
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

            {/* Just In */}
            {latestGrid.length > 0 && (
              <section className="mb-16">
                <SectionHead label="Top Stories" title="Just In" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {latestGrid.map((art) => (<ArticleCard key={art._id} article={art} />))}
                </div>
              </section>
            )}

            {/* Editor's Pick */}
            {editorsPick.length > 0 && (
              <section className="mb-16">
                <div className="flex items-end justify-between mb-5 pb-3 border-b-2 border-brand-navy">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[3px] text-brand-navy mb-1 font-sans">Curated</p>
                    <h2 className="text-3xl font-serif font-bold text-ink italic flex items-center gap-2">
                      Features
                      
                    </h2>
                  </div>
                  <Link to="/search" className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted hover:text-brand-navy transition-colors font-sans mb-1">
                    More <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {editorsPick.map((art) => (<ArticleCard key={art._id} article={art} />))}
                </div>
              </section>
            )}

            {/* Opinion */}
            {opinions.length > 0 && (
              <section className="mb-16">
                <SectionHead label="Voices" title="Opinion & Analysis" href="/category/opinion" accent="#0d1e29" />
                <div>
                  {opinions.map((art) => (<OpinionCard key={art._id} article={art} />))}
                </div>
              </section>
            )}

            {/* The Orbis Original */}
            <TheOrbisOriginal articles={storiesThatMattered} />

            {/* Must Read */}
            {mustReads.length > 0 && (
              <section className="mb-16">
                <div className="flex items-end justify-between mb-6 pb-3 border-b-2 border-brand-red">
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-[3px] text-brand-red mb-1 font-sans">Essential Reading</p>
                    <h2 className="text-3xl font-serif font-bold text-ink italic">Must Read</h2>
                  </div>
                  <Link to="/search" className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[1.5px] text-ink-muted hover:text-brand-navy transition-colors font-sans mb-1">
                    More <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {mustReads.slice(0, 4).map((art) => (<ArticleCard key={art._id} article={art} variant="featured-side" />))}
                </div>
              </section>
            )}

            {/* In Their Words */}
            {articles.filter((a) => a.category?.slug === 'in-their-words').length > 0 && (
              <section className="mb-16">
                <SectionHead label="Voices" title="In Their Words" href="/in-their-words" accent="#0d1e29" />
                <div className="grid md:grid-cols-3 gap-5">
                  {articles.filter((a) => a.category?.slug === 'in-their-words').slice(0, 3).map((art) => (
                    <ArticleCard key={art._id} article={art} />
                  ))}
                </div>
              </section>
            )}

            {/* Double Lens */}
            {articles.filter((a) => a.contentType === 'ground-report').length >= 2 && (
              <section className="my-16">
                <div className="mb-6 pb-3 border-b-2 border-brand-navy">
                  <p className="text-[12px] font-black uppercase tracking-[3px] text-brand-navy mb-1 font-sans">Perspective</p>
                  <h2 className="text-3xl font-serif font-bold text-ink mb-1 italic">Double Lens</h2>
                  <p className="text-[14px] text-ink-muted font-sans max-w-lg leading-relaxed">
                    We bring together stories that appear similar on the surface but lead to very different outcomes, revealing deeper social and political realities.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-0 border border-gray-200 rounded-xl overflow-hidden">
                  {articles.filter((a) => a.contentType === 'ground-report').slice(0, 2).map((art, i) => (
                    <div key={art._id} className={`p-5 ${i === 0 ? 'border-b md:border-b-0 md:border-r border-gray-200' : ''}`}>
                      <span className="text-[11px] font-black uppercase tracking-[2px] px-2 py-0.5 bg-brand-navy text-brand-yellow rounded-full font-sans">
                        {i === 0 ? 'Lens A' : 'Lens B'}
                      </span>
                      <Link to={`/article/${art.slug}`} className="block mt-3 no-underline">
                        {art.featuredImage?.url && (
                          <img src={art.featuredImage.url} alt={art.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                        )}
                        <h3 className="font-serif font-bold text-[17px] text-ink leading-snug hover:text-brand-navy transition-colors line-clamp-3">
                          {art.title}
                        </h3>
                      </Link>
                      {art.excerpt && (
                        <p className="text-[14px] text-ink-muted font-sans mt-2 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Through the Lens */}
            {lensArticles.length > 0 && (
              <section className="my-16">
                <SectionHead label="Visual Journalism" title="Through the Lens" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-3 gap-4">
                  {lensArticles.map((art) => (
                    <Link key={art._id} to={`/article/${art.slug}`} className="group block no-underline relative overflow-hidden rounded-xl bg-gray-100">
                      <div className="overflow-hidden" style={{ aspectRatio: '1080 / 1350' }}>
                        {art.featuredImage?.url ? (
                          <img src={art.featuredImage.url} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-navy to-brand-navy-dark" />
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                        <h3 className="font-serif font-bold text-lg text-white group-hover:text-brand-yellow transition-colors leading-snug line-clamp-2">{art.title}</h3>
                        <p className="text-white/60 text-sm font-sans mt-1">{formatDate(art.publishedAt ?? art.createdAt)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* More stories */}
            {moreGrid.length > 0 && (
              <section className="mb-16">
                <SectionHead title="More Stories" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {moreGrid.map((art) => (<ArticleCard key={art._id} article={art} />))}
                </div>
                <div className="text-center mt-8">
                  <Link to="/search" className="btn-secondary">
                    Load More Stories <ArrowRight size={13} />
                  </Link>
                </div>
              </section>
            )}

            {/* Google News CTA — slim bar */}
            <section className="mb-4">
              <div className="flex items-center gap-4 bg-surface-secondary border border-gray-200 rounded-xl px-5 py-3.5">
                <svg viewBox="0 0 24 24" width="24" height="24" aria-label="Google News" className="flex-shrink-0">
                  <path fill="#4285F4" d="M12 24A12 12 0 1 0 12 0a12 12 0 0 0 0 24z"/>
                  <path fill="white" d="M12 5.5l-1.5 3h3L12 5.5zM7 10h10v1.5H7V10zm0 3h10v1.5H7V13zm0 3h6v1.5H7V16z"/>
                </svg>
                <p className="text-[13px] font-sans text-ink flex-1">
                  <span className="font-bold">Follow us on Google News</span>
                  <span className="text-ink-muted hidden sm:inline"> — stay updated with every story we publish</span>
                </p>
                <a
                  href="https://news.google.com/publications/CAAqBwgKMLnO7QswyvjrAw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-brand-navy text-white text-[11px] font-black uppercase tracking-[1.5px] px-4 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors font-sans flex-shrink-0"
                >
                  Follow <ArrowRight size={11} />
                </a>
              </div>
            </section>

            {/* Category strips */}
            {categories.slice(0, 3).map((cat: any) => {
              const catArticles = articles.filter((a) => a.category?.slug === cat.slug).slice(0, 3);
              if (catArticles.length < 2) return null;
              return (
                <section key={cat._id}>
                  <SectionHead title={cat.name} href={`/category/${cat.slug}`} accent={cat.color ?? '#c8392b'} />
                  <div className="grid md:grid-cols-3 gap-5">
                    {catArticles.map((art) => (<ArticleCard key={art._id} article={art} />))}
                  </div>
                </section>
              );
            })}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-5">

              {mostReadArticles.length > 0 && <MostRead articles={mostReadArticles} />}

              <DonateCard />

              {popularArticles.length > 0 && <PopularStories articles={popularArticles} />}

              

              {/* About the newsroom */}
              <div className="border border-gray-200 p-5 rounded-xl">
                <p className="text-[12px] font-black uppercase tracking-[3px] text-ink-muted mb-3 font-sans">About Us</p>
                <p className="text-[12px] text-ink-muted font-sans leading-relaxed mb-3">
                  The Orbis Journal is an independent media platform dedicated to human rights, social justice, and the stories of marginalized communities.
                </p>
                <Link to="/about" className="text-[11px] font-black uppercase tracking-[2px] text-brand-navy hover:text-brand-red transition-colors font-sans">
                  Our Mission →
                </Link>
              </div>

              {/* Follow Us */}
              <div className="border border-gray-200 p-5 rounded-xl">
                <p className="text-[12px] font-black uppercase tracking-[3px] text-ink-muted mb-4 font-sans">Follow Us</p>
                <div className="grid grid-cols-3 gap-3">
                  <a href="https://x.com/TheOrbisJournal" target="_blank" rel="noopener noreferrer" title="Twitter / X"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 hover:bg-black hover:text-white text-ink transition-all duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://www.instagram.com/theorbisjournal?igsh=cHBlbWJqMjhzcjY0" target="_blank" rel="noopener noreferrer" title="Instagram"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 hover:bg-gradient-to-br hover:from-pink-500 hover:to-rose-600 hover:text-white text-pink-600 transition-all duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" title="YouTube"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition-all duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                  </a>
                  <a href="https://www.facebook.com/share/1DxGLWEwoN/" target="_blank" rel="noopener noreferrer" title="Facebook"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 transition-all duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn"
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-50 hover:bg-sky-700 hover:text-white text-sky-600 transition-all duration-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  
                </div>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}