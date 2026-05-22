import { useQuery } from '@tanstack/react-query';
import { articlesService } from '../services/articles';
import BreakingTicker from '../components/home/BreakingTicker';
import HeroSection from '../components/home/HeroSection';
import LatestSection from '../components/home/LatestSection';
import OpinionSection from '../components/home/OpinionSection';
import CategorySection from '../components/home/CategorySection';
import NewsletterInline from '../components/newsletter/NewsletterInline';
import { HeroSkeleton, ArticleCardSkeleton } from '../components/common/Skeleton';

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['homepage'],
    queryFn: () => articlesService.getHomepageData(),
    staleTime: 2 * 60 * 1000,
  });

  const hp = data?.data;

  if (isLoading) {
    return (
      <div>
        <div className="h-9 bg-brand-navy" />
        <div className="container-site py-8">
          <HeroSkeleton />
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3].map((i) => <ArticleCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !hp) {
    return (
      <div className="container-site py-20 text-center">
        <p className="text-ink-muted font-sans text-lg">Could not load content. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breaking news ticker */}
      {hp.breaking && hp.breaking.length > 0 && (
        <BreakingTicker items={hp.breaking as any} />
      )}

      {/* Hero section */}
      {hp.hero && (
        <HeroSection hero={hp.hero} featured={hp.featured} />
      )}

      {/* Latest news */}
      <LatestSection articles={hp.latest} />

      {/* Category sections */}
      {hp.categoryPreviews.slice(0, 4).map((preview) => (
        <CategorySection
          key={preview._id}
          categorySlug={preview._id}
          categoryName={preview.categoryName}
          categoryColor={preview.categoryColor}
          articles={preview.articles as any}
        />
      ))}

      {/* Opinion section */}
      {hp.opinionPicks.length > 0 && (
        <OpinionSection articles={hp.opinionPicks} />
      )}

      {/* Newsletter CTA */}
      <section className="py-12">
        <div className="container-site">
          <NewsletterInline />
        </div>
      </section>
    </div>
  );
}
