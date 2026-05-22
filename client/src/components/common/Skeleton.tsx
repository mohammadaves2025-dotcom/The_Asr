import { cn } from '../../utils/helpers';

export function SkeletonBox({ className }: { className?: string }) {
  return (
    <div
      className={cn('skeleton rounded', className)}
      style={{
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonBox className="aspect-video w-full" />
      <SkeletonBox className="h-3 w-20" />
      <SkeletonBox className="h-5 w-full" />
      <SkeletonBox className="h-5 w-3/4" />
      <SkeletonBox className="h-3 w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-0 min-h-[520px]">
      <SkeletonBox className="w-full h-full min-h-[320px]" />
      <div className="bg-brand-navy p-8 flex flex-col justify-end gap-4">
        <SkeletonBox className="h-3 w-24 opacity-30" />
        <SkeletonBox className="h-8 w-full opacity-30" />
        <SkeletonBox className="h-8 w-2/3 opacity-30" />
        <SkeletonBox className="h-4 w-full opacity-20" />
      </div>
    </div>
  );
}
