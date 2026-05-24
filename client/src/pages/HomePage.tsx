import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, BookOpen, Feather } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService, categoriesService } from '../services/articles';
import type { Article } from '../types';

// ── Breaking Ticker ────────────────────────────────────────────────────────────
function BreakingTicker({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  const text = articles.map(a => a.title).join('   ·   ');
  return (
    <div className="bg-brand-red text-white flex items-stretch overflow-hidden border-b border-white/10">
      <div className="flex-shrink-0 bg-brand-navy px-4 flex items-center gap-2 min-w-[90px]">
        <Zap size={11} className="text-brand-yellow" fill="currentColor" />
        <span className="text-[9px] font-black tracking-[3px] uppercase text-brand-yellow whitespace-nowrap">Breaking</span>
      </div>
      <div className="flex-1 overflow-hidden py-2.5 relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-red to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-red to-transparent z-10" />
        <div className="whitespace-nowrap inline-flex items-center ticker-animate text-[12px] font-sans font-medium">
          {text}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({
  label, title, href, accent = '#c8392b'
}: { label?: string; title: string; href: string; accent?: string }) {
  return (
    <div className="flex items-end justify-between mb-5 pb-3" style={{ borderBottom: `2px solid ${accent}` }}>
      <div>
        {label && <p className="text-[9px] font-black uppercase tracking-[3px] mb-1 font-sans" style={{ color: accent }}>{label}</p>}
        <h2 className="text-xl font-serif font-bold text-ink">{title}</h2>
      </div>
      <Link to={href}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-muted hover:text-brand-navy transition-colors font-sans flex-shrink-0 mb-1">
        More <ArrowRight size={11} />
      </Link>
    </div>
  );
}

// ── Most Read Sidebar ─────────────────────────────────────────────────────────
function MostRead({ articles }: { articles: Article[] }) {
  return (
    <div className="border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-ink">
        <TrendingUp size={14} className="text-ink" />
        <h2 className="text-sm font-serif font-bold text-ink">Most Read</h2>
      </div>
      <ol className="space-y-0">
        {articles.slice(0, 5).map((art, i) => (
          <li key={art._id} className="group border-b border-gray-100 last:border-0 py-4 flex items-start gap-3">
            <span className="text-[28px] font-serif font-black text-gray-100 leading-none flex-shrink-0 mt-0.5 w-8 text-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Link to={`/article/${art.slug}`}
                className="text-[13px] font-serif font-semibold text-ink line-clamp-3 group-hover:text-brand-navy transition-colors block leading-snug">
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

// ── Newsletter Sidebar Box ─────────────────────────────────────────────────────
function NewsletterBox() {
  return (
    <div className="bg-brand-navy text-white p-5 mt-5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen size={13} className="text-brand-yellow" />
        <p className="text-[9px] font-black uppercase tracking-[3px] text-brand-yellow">Free Newsletter</p>
      </div>
      <h3 className="font-serif font-bold text-lg leading-snug mb-1.5">Stories that matter, weekly.</h3>
      <p className="text-white/45 text-[11px] mb-4 font-sans leading-relaxed">Join 15,000+ readers. No spam. No algorithms.</p>
      <div className="flex flex-col gap-2">
        <input type="email" placeholder="your@email.com"
          className="bg-white/10 border border-white/20 text-white placeholder:text-white/25 px-3 py-2.5 text-sm outline-none focus:border-brand-yellow/60 transition-colors font-sans" />
        <button className="bg-brand-yellow text-brand-navy font-black text-[10px] uppercase tracking-[2px] py-2.5 hover:bg-yellow-400 transition-colors font-sans">
          Subscribe Free →
        </button>
      </div>
    </div>
  );
}

// ── Support Card ────────────────────────────────────────────────────────────────
function SupportCard() {
  return (
    <div className="border-2 border-brand-navy p-5 mt-5">
      <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-2 font-sans">Support Independent Journalism</p>
      <p className="font-serif font-bold text-[15px] text-ink mb-4 leading-snug">Fearless reporting needs your support.</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {['₹200', '₹500', '₹1000', '₹2500'].map(a => (
          <button key={a}
            className="border border-gray-200 text-ink text-[11px] font-bold py-2 hover:bg-brand-navy hover:text-brand-yellow hover:border-brand-navy transition-all font-sans">
            {a}
          </button>
        ))}
      </div>
      <Link to="/support"
        className="block text-center bg-brand-navy text-brand-yellow font-black text-[10px] uppercase tracking-[2px] py-3 hover:bg-brand-navy-dark transition-colors font-sans">
        Donate Now →
      </Link>
    </div>
  );
}

// ── Opinion Card ─────────────────────────────────────────────────────────────
function OpinionCard({ article }: { article: Article }) {
  const authorName = article.isGuestAuthor && article.guestAuthorName ? article.guestAuthorName : article.author?.name;
  return (
    <div className="group py-5 border-b border-gray-100 last:border-0 flex gap-4">
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[9px] font-black uppercase tracking-[1.5px] bg-brand-navy/10 text-brand-navy px-2 py-0.5 mb-2">
          Opinion
        </span>
        <Link to={`/article/${article.slug}`}
          className="block font-serif font-bold text-[15px] text-ink line-clamp-2 leading-snug group-hover:text-brand-navy transition-colors mb-2">
          {article.title}
        </Link>
        <div className="flex items-center gap-2">
          {article.author?.avatar ? (
            <img src={article.author.avatar} alt={authorName}
              className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-[9px]">{authorName?.[0]}</span>
            </div>
          )}
          <span className="text-[11px] text-ink-secondary font-sans font-medium">{authorName}</span>
          <Feather size={10} className="text-ink-faint ml-auto" />
        </div>
      </div>
      {article.featuredImage?.url && (
        <Link to={`/article/${article.slug}`} className="flex-shrink-0">
          <div className="w-20 h-20 overflow-hidden bg-gray-100">
            <img src={article.featuredImage.url} alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        </Link>
      )}
    </div>
  );
}

// ── Homepage Skeleton ─────────────────────────────────────────────────────────
function HomePageSkeleton() {
  return (
    <div className="bg-paper">
      <div className="container-site py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-gray-200 h-80 md:h-[500px]" />
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="bg-gray-200 w-16 h-16 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 grid md:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-gray-200 h-56" />)}
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

export default function HomePage() {
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'home'],
    queryFn: () => articlesService.getAll({ limit: 24, status: 'published', sort: '-publishedAt' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const articles: Article[] = articlesData?.data?.data?.articles ?? [];
  const categories = categoriesData?.data?.data?.categories ?? [];

  if (isLoading) return <HomePageSkeleton />;

  const breaking = articles.filter(a => a.isBreaking);
  const hero = articles.find(a => a.isFeatured) ?? articles[0];
  const sideStories = articles.filter(a => a._id !== hero?._id).slice(0, 4);
  const latestGrid = articles.filter(a => a._id !== hero?._id && !sideStories.find(s => s._id === a._id)).slice(0, 6);
  const moreGrid   = articles.filter(a => a._id !== hero?._id && !sideStories.find(s => s._id === a._id) && !latestGrid.find(l => l._id === a._id)).slice(0, 6);
  const mostRead = [...articles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const opinions = articles.filter(a => a.contentType === 'opinion').slice(0, 3);
  const investigations = articles.filter(a => a.contentType === 'investigation').slice(0, 4);

  return (
    <div className="bg-paper min-h-screen">
      {/* Breaking Ticker */}
      {breaking.length > 0 && <BreakingTicker articles={breaking} />}

      {/* Thin support bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container-site flex items-center justify-between py-1.5">
          <p className="text-[10px] text-ink-muted font-sans hidden md:block">
            <span className="font-semibold text-ink">The Asr</span> · Independent, reader-funded journalism on human rights &amp; minorities
          </p>
          <Link to="/support"
            className="ml-auto text-[9px] font-black uppercase tracking-[2px] text-brand-red hover:text-brand-red-dark transition-colors font-sans">
            Support Our Work →
          </Link>
        </div>
      </div>

      <div className="container-site py-7 md:py-10">
        {/* ── HERO: Full bleed hero + side stack ── */}
        {hero && (
          <section className="mb-10 border-b-2 border-ink pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
              {/* Hero article */}
              <div className="lg:col-span-8">
                <ArticleCard article={hero} variant="hero" />
              </div>
              {/* Side stack */}
              <div className="lg:col-span-4 border-t-2 lg:border-t-0 lg:border-l-2 border-ink lg:pl-6 pt-6 lg:pt-0">
                <p className="section-label mb-4">Editor's Picks</p>
                <div>
                  {sideStories.map(art => (
                    <ArticleCard key={art._id} article={art} variant="text-only" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── MAIN GRID + SIDEBAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

          {/* Main Content */}
          <main className="lg:col-span-8 space-y-12">

            {/* Latest Stories */}
            {latestGrid.length > 0 && (
              <section>
                <SectionHead label="Top Stories" title="Latest" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {latestGrid.map(art => <ArticleCard key={art._id} article={art} />)}
                </div>
              </section>
            )}

            {/* Investigations */}
            {investigations.length > 0 && (
              <section>
                <SectionHead label="Deep Dive" title="Investigations" href="/category/investigation" accent="#6d28d9" />
                <div className="grid md:grid-cols-2 gap-5">
                  {/* First investigation large */}
                  <div className="md:col-span-2">
                    <ArticleCard article={investigations[0]} variant="featured-side" />
                  </div>
                  {investigations.slice(1, 3).map(art => (
                    <ArticleCard key={art._id} article={art} />
                  ))}
                </div>
              </section>
            )}

            {/* Opinion strip */}
            {opinions.length > 0 && (
              <section>
                <SectionHead label="Voices" title="Opinion &amp; Analysis" href="/category/opinion" accent="#0d1e29" />
                <div>
                  {opinions.map(art => <OpinionCard key={art._id} article={art} />)}
                </div>
              </section>
            )}

            {/* More Stories */}
            {moreGrid.length > 0 && (
              <section>
                <SectionHead title="More Stories" href="/search" accent="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {moreGrid.map(art => <ArticleCard key={art._id} article={art} />)}
                </div>
                <div className="text-center mt-8">
                  <Link to="/search" className="btn-secondary">
                    Load More Stories <ArrowRight size={13} />
                  </Link>
                </div>
              </section>
            )}

            {/* Category strips from backend */}
            {categories.slice(0, 3).map((cat: any) => {
              const catArticles = articles.filter(a => a.category?.slug === cat.slug).slice(0, 3);
              if (catArticles.length < 2) return null;
              return (
                <section key={cat._id}>
                  <SectionHead title={cat.name} href={`/category/${cat.slug}`} accent={cat.color ?? '#c8392b'} />
                  <div className="grid md:grid-cols-3 gap-5">
                    {catArticles.map(art => <ArticleCard key={art._id} article={art} />)}
                  </div>
                </section>
              );
            })}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-0">
            {mostRead.length > 0 && <MostRead articles={mostRead} />}
            <NewsletterBox />
            <SupportCard />

            {/* Fund a Story call-out */}
            <div className="mt-5 bg-surface-secondary border border-gray-200 p-5">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-2 font-sans">Unique to The Asr</p>
              <h4 className="font-serif font-bold text-[15px] text-ink mb-2 leading-snug">Fund a story you care about</h4>
              <p className="text-[11px] text-ink-muted font-sans mb-3 leading-relaxed">Readers can directly crowdfund specific investigations and ground reports.</p>
              <Link to="/support" className="text-[10px] font-black uppercase tracking-[2px] text-brand-red hover:underline font-sans">
                Learn How →
              </Link>
            </div>

            {/* Social block */}
            <div className="mt-5 border border-gray-200 p-5">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-4 font-sans">Follow Us</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Twitter / X', href: '#', color: '#000' },
                  { name: 'Instagram', href: '#', color: '#E1306C' },
                  { name: 'YouTube', href: '#', color: '#FF0000' },
                  { name: 'Telegram', href: '#', color: '#0088CC' },
                ].map(s => (
                  <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="text-center border border-gray-200 py-2.5 text-[10px] font-bold text-ink-muted hover:text-ink hover:border-gray-400 transition-all font-sans">
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
