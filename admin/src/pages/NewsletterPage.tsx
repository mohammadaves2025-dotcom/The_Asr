import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Download } from 'lucide-react';
import { newsletterAdmin } from '../services/admin';
import { formatDate } from '../utils/helpers';

export default function NewsletterPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'newsletter', page],
    queryFn: () => newsletterAdmin.getAll({ page, limit: 50 }),
  });

  const subscribers = (data?.data?.data?.subscribers || []) as any[];
  const meta = data?.data?.meta;

  const exportCSV = () => {
    if (!subscribers.length) return;
    const rows = [['Email', 'Name', 'Source', 'Subscribed At']];
    subscribers.forEach((s) => rows.push([s.email, s.name || '', s.source, s.subscribedAt ? formatDate(s.subscribedAt) : '']));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theorbisjournal-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="admin-card p-5 flex items-center gap-4">
        <div className="p-3 bg-brand-navy/10 rounded">
          <Mail size={20} className="text-brand-navy" />
        </div>
        <div>
          <p className="text-xs font-semibold font-sans uppercase tracking-wider text-ink-muted">Confirmed Subscribers</p>
          <p className="text-2xl font-bold font-sans text-ink">{meta?.total?.toLocaleString() || 0}</p>
        </div>
        <button onClick={exportCSV} className="admin-btn-secondary ml-auto gap-2 text-xs">
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Email</th>
                <th className="table-th">Name</th>
                <th className="table-th">Source</th>
                <th className="table-th">Subscribed At</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array(4).fill(0).map((_, j) => (
                      <td key={j} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={4} className="table-td text-center text-ink-muted py-8">No subscribers yet</td></tr>
              ) : subscribers.map((s) => (
                <tr key={s._id} className="table-row">
                  <td className="table-td font-medium">{s.email}</td>
                  <td className="table-td text-ink-muted">{s.name || '—'}</td>
                  <td className="table-td">
                    <span className="text-[11px] font-bold uppercase tracking-wide bg-gray-100 text-ink-muted px-2 py-0.5">{s.source}</span>
                  </td>
                  <td className="table-td text-ink-muted text-xs whitespace-nowrap">
                    {s.subscribedAt ? formatDate(s.subscribedAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
            <p className="text-xs text-ink-muted font-sans">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrevPage} className="admin-btn-secondary py-1.5 text-xs">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={!meta.hasNextPage} className="admin-btn-secondary py-1.5 text-xs">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
