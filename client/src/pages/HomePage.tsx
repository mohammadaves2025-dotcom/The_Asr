import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import ArticleCard from '../components/article/ArticleCard';
import { articlesService, categoriesService } from '../services/articles';
import type { Article } from '../types';

// ── Breaking Ticker ───────────────────────────────────────────────────────────
function BreakingTicker({ articles }: { articles: Article[] }) {
  if (!articles.length) return null;
  const text = articles.map(a => a.title).join('   ●   ');
  return (
    <div className="bg-accent-red text-white flex items-stretch overflow-hidden">
      <div className="flex-shrink-0 bg-brand-navy px-4 flex items-center gap-2">
        <Zap size={12} className="text-brand-yellow" />
        <span className="text-[10px] font-black tracking-[3px] uppercase text-brand-yellow whitespace-nowrap">Breaking</span>
      </div>
      <div className="flex-1 overflow-hidden py-2.5">
        <div className="whitespace-nowrap inline-flex items-center animate-[ticker_30s_linear_infinite] font-sans text-sm font-medium">
          {text}&nbsp;&nbsp;&nbsp;●&nbsp;&nbsp;&nbsp;{text}
        </div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHead({ title, href, color }: { title: string; href: string; color?: string }) {
  return (
    <div className="flex items-center justify-between mb-6 pb-3 border-b-2" style={{ borderColor: color ?? '#122837' }}>
      <h2 className="text-xl font-serif font-bold text-ink">{title}</h2>
      <Link to={href} className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-ink-muted hover:text-brand-navy transition-colors">
        More <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Most Read Sidebar ─────────────────────────────────────────────────────────
function MostRead({ articles }: { articles: Article[] }) {
  return (
    <div>
      <div className="flex items-center mb-5 pb-3 border-b-2 border-brand-navy">
        <h2 className="text-base font-serif font-bold text-ink">Most Read</h2>
      </div>
      <ol className="divide-y divide-gray-100">
        {articles.slice(0, 5).map((art, i) => (
          <li key={art._id} className="py-4 flex items-start gap-3 group">
            <span className="text-3xl font-serif font-black text-gray-200 leading-none flex-shrink-0 w-7">{i + 1}</span>
            <div>
              <Link to={`/article/${art.slug}`}
                className="text-sm font-serif font-semibold text-ink line-clamp-3 group-hover:text-brand-navy transition-colors block">
                {art.title}
              </Link>
              <p className="text-xs text-ink-muted mt-1">{art.readTime}m read</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Newsletter Inline ─────────────────────────────────────────────────────────
function NewsletterBox() {
  return (
    <div className="bg-brand-navy text-white p-6 mt-8">
      <p className="text-[10px] font-bold uppercase tracking-[3px] text-brand-yellow mb-2">Free Newsletter</p>
      <h3 className="font-serif font-bold text-lg mb-2">Get our best stories weekly.</h3>
      <p className="text-white/50 text-xs mb-4">Join 15,000+ readers. No spam.</p>
      <div className="flex flex-col gap-2">
        <input type="email" placeholder="your@email.com"
          className="bg-white/10 border border-white/20 text-white placeholder:text-white/30 px-3 py-2.5 text-sm outline-none focus:border-white/60" />
        <button className="bg-brand-yellow text-brand-navy font-bold text-xs uppercase tracking-widest py-2.5 hover:bg-brand-yellow-dark transition-colors">
          Subscribe Free
        </button>
      </div>
    </div>
  );
}

// ── Donate Card ────────────────────────────────────────────────────────────────
function DonateCard() {
  return (
    <div className="border-2 border-brand-navy p-5 mt-6">
      <p className="text-[10px] font-bold uppercase tracking-[3px] text-ink-muted mb-2">Support Us</p>
      <p className="font-serif font-bold text-base text-ink mb-3">Fearless journalism needs your support.</p>
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {['₹200', '₹500', '₹1000', '₹2000'].map(a => (
          <button key={a} className="border border-gray-200 text-ink text-xs font-bold py-2 hover:bg-brand-navy hover:text-brand-yellow hover:border-brand-navy transition-all">
            {a}
          </button>
        ))}
      </div>
      <Link to="/support" className="block text-center bg-brand-navy text-brand-yellow font-bold text-xs uppercase tracking-widest py-3 hover:bg-brand-navy-dark transition-colors">
        Donate Now →
      </Link>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function HomePageSkeleton() {
  return (
    <div className="container-site py-10 animate-pulse">
      <div className="h-72 md:h-96 bg-gray-200 mb-8" />
      <div className="grid md:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i}>
            <div className="h-48 bg-gray-200 mb-3" />
            <div className="h-4 bg-gray-200 mb-2 rounded" />
            <div className="h-4 bg-gray-200 w-3/4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', 'home'],
    queryFn: () => articlesService.getAll({ limit: 20, status: 'published', sort: '-publishedAt' }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesService.getAll(),
    staleTime: 10 * 60 * 1000,
  });

  const articles: Article[] = articlesData?.data?.data?.articles ?? [];

  if (isLoading) return <HomePageSkeleton />;

  const breaking = articles.filter(a => a.isBreaking);
  const featured = articles.find(a => a.isFeatured) ?? articles[0];
  const secondary = articles.filter(a => a._id !== featured?._id).slice(0, 2);
  const latest = articles.filter(a => a._id !== featured?._id && !secondary.find(s => s._id === a._id)).slice(0, 6);
  const mostRead = [...articles].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 5);
  const opinions = articles.filter(a => a.contentType === 'opinion').slice(0, 3);
  const investigations = articles.filter(a => a.contentType === 'investigation').slice(0, 3);

  return (
    <div className="bg-white">
      {/* Breaking Ticker */}
      {breaking.length > 0 && <BreakingTicker articles={breaking} />}

      {/* Support top strip */}
      <div className="bg-surface-secondary border-b border-gray-200 py-2">
        <div className="container-site flex items-center justify-between">
          <p className="text-xs text-ink-muted font-sans hidden md:block">
            <span className="font-semibold text-ink">The Asr</span> — Independent, reader-funded journalism.
          </p>
          <Link to="/support" className="ml-auto text-[10px] font-black uppercase tracking-[2px] text-accent-red hover:text-accent-red/80 transition-colors">
            Support Us →
          </Link>
        </div>
      </div>

      <div className="container-site py-8 md:py-10">

        {/* ── HERO SECTION ── */}
        {featured && (
          <section className="mb-10">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Main featured */}
              <div className="md:col-span-2">
                <ArticleCard article={featured} variant="featured-side" />
              </div>
              {/* Side stories */}
              <div className="flex flex-col divide-y divide-gray-100 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
                {secondary.map(art => (
                  <ArticleCard key={art._id} article={art} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── MAIN + SIDEBAR GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

          {/* Main content */}
          <div className="lg:col-span-8 space-y-10">

            {/* Latest Stories */}
            {latest.length > 0 && (
              <section>
                <SectionHead title="Latest Stories" href="/search" color="#c8392b" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {latest.map(art => <ArticleCard key={art._id} article={art} />)}
                </div>
              </section>
            )}

            {/* Investigations */}
            {investigations.length > 0 && (
              <section>
                <SectionHead title="Investigations" href="/category/investigation" color="#7c3aed" />
                <div className="grid md:grid-cols-3 gap-6">
                  {investigations.map(art => <ArticleCard key={art._id} article={art} />)}
                </div>
              </section>
            )}

            {/* Opinion */}
            {opinions.length > 0 && (
              <section>
                <SectionHead title="Opinion & Analysis" href="/category/opinion" color="#0e7490" />
                <div className="divide-y divide-gray-100">
                  {opinions.map(art => <ArticleCard key={art._id} article={art} variant="horizontal" />)}
                </div>
              </section>
            )}

            {/* All remaining articles grid */}
            {articles.length > 8 && (
              <section>
                <SectionHead title="More Stories" href="/search" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.slice(8, 14).map(art => <ArticleCard key={art._id} article={art} />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-0">
            <MostRead articles={mostRead} />
            <NewsletterBox />
            <DonateCard />
          </aside>
        </div>
      </div>
    </div>
  );
}
