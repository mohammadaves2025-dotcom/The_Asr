import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { submissionsAdmin } from '../services/admin';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['', 'new', 'under-review', 'accepted', 'rejected', 'published'];
const TYPE_OPTIONS = ['', 'tip', 'community-voice', 'letter-to-editor', 'youth-writer', 'correction'];

export default function SubmissionsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'submissions', { status, type, page }],
    queryFn: () => submissionsAdmin.getAll({ status: status || undefined, type: type || undefined, page, limit: 20 }),
  });

  const submissions = data?.data?.data?.submissions || [];
  const meta = data?.data?.meta;

  const updateStatus = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: string }) =>
      submissionsAdmin.updateStatus(id, newStatus, reviewNote),
    onSuccess: () => {
      toast.success('Status updated');
      qc.invalidateQueries({ queryKey: ['admin', 'submissions'] });
      setExpanded(null);
      setReviewNote('');
    },
    onError: () => toast.error('Failed to update'),
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <p className="text-xs font-sans text-ink-muted">{meta?.total || 0} total submissions</p>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-wrap gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="admin-select w-auto min-w-[140px] text-sm"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          className="admin-select w-auto min-w-[140px] text-sm"
        >
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t || 'All Types'}</option>)}
        </select>
      </div>

      {/* List */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-ink-muted text-sm font-sans">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="p-10 text-center text-ink-muted text-sm font-sans">No submissions found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <div key={sub._id} className="p-5">
                <div
                  className="flex items-start justify-between gap-4 cursor-pointer"
                  onClick={() => setExpanded(expanded === sub._id ? null : sub._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-[10px] font-bold font-sans uppercase tracking-widest text-ink-muted">{sub.type}</span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-sm font-semibold text-ink">{sub.subject}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                      <span>By {sub.name}</span>
                      <span>·</span>
                      <span>{sub.email}</span>
                      <span>·</span>
                      <span>{formatDate(sub.createdAt)}</span>
                    </div>
                  </div>
                  <button className="p-1 text-ink-muted">
                    {expanded === sub._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {expanded === sub._id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    <p className="text-sm text-ink-secondary font-sans leading-relaxed whitespace-pre-line bg-surface-secondary p-4 border border-gray-200">
                      {sub.body}
                    </p>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="flex-1 min-w-[200px]">
                        <label className="admin-label">Review Note (optional)</label>
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="admin-input resize-none h-16"
                          placeholder="Add a review note..."
                        />
                      </div>
                      <div className="flex gap-2">
                        {['under-review', 'accepted', 'rejected'].map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus.mutate({ id: sub._id, newStatus: s })}
                            className={`admin-btn text-xs ${
                              s === 'accepted' ? 'admin-btn-success' :
                              s === 'rejected' ? 'admin-btn-danger' :
                              'admin-btn-secondary'
                            }`}
                          >
                            {s.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

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
