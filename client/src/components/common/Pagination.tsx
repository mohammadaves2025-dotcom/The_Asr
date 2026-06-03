// ─────────────────────────────────────────────────────────────────────────────
// Pagination.tsx
// client/src/components/common/Pagination.tsx
//
// Reusable numbered pagination component.
// Renders: ← 1 2 3 … 8 9 10 →
// Page is synced to the URL query param ?page=N so links are shareable.
// ─────────────────────────────────────────────────────────────────────────────
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page:        number;        // current page (1-indexed)
  totalPages:  number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page-number window: always show first, last, and ±2 around current
  const pages: (number | '…')[] = [];

  const addPage = (n: number) => {
    if (n >= 1 && n <= totalPages) pages.push(n);
  };

  addPage(1);
  if (page > 4) pages.push('…');
  for (let i = Math.max(2, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) {
    addPage(i);
  }
  if (page < totalPages - 3) pages.push('…');
  if (totalPages > 1) addPage(totalPages);

  // Deduplicate (edge cases where window overlaps with 1 or last)
  const deduped = pages.filter(
    (p, i) => i === 0 || p !== pages[i - 1]
  );

  return (
    <nav
      className="flex items-center justify-center gap-1 mt-12 flex-wrap"
      aria-label="Pagination"
    >
      {/* ← Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-[11px] font-bold font-sans text-ink-muted hover:text-brand-navy hover:border-brand-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft size={13} /> Prev
      </button>

      {/* Page numbers */}
      {deduped.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-2 py-2 text-[11px] text-ink-muted font-sans select-none"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-9 h-9 flex items-center justify-center text-[12px] font-bold font-sans border transition-all ${
              p === page
                ? 'bg-brand-navy text-brand-yellow border-brand-navy'
                : 'border-gray-200 text-ink-muted hover:text-brand-navy hover:border-brand-navy'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* → Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-[11px] font-bold font-sans text-ink-muted hover:text-brand-navy hover:border-brand-navy disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        Next <ChevronRight size={13} />
      </button>
    </nav>
  );
}