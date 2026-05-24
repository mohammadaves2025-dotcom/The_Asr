import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, XCircle, Trash2, Flag, Search, ExternalLink,
  MessageSquare, Loader, ChevronLeft, ChevronRight, RefreshCw,
} from 'lucide-react';
import { commentsAdmin } from '../services/admin';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatRelative, formatDateTime, cn } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUS_FILTERS = [
  { value: '', label: 'All Comments' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'flagged', label: 'Flagged' },
];

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000';

interface Comment {
  _id: string;
  body: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  reportCount: number;
  likes: number;
  isEdited: boolean;
  createdAt: string;
  author: { _id: string; name: string; avatar?: string; email?: string; role: string };
  article: { _id: string; title: string; slug: string } | null;
  parentComment?: string | null;
}

export default function CommentsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Comment | null>(null);
  const [moderationNote, setModerationNote] = useState<Record<string, string>>({});
  const [expandedNote, setExpandedNote] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'comments', { status, search, page }],
    queryFn: () => commentsAdmin.getAll({
      status: status || undefined,
      search: search || undefined,
      page,
      limit: 25,
    }),
    placeholderData: (prev) => prev,
  });

  const comments: Comment[] = data?.data?.data?.comments ?? [];
  const meta = data?.data?.meta;

  // ── Mutations ───────────────────────────────────────────────────────────────

  const moderateMutation = useMutation({
    mutationFn: ({ id, newStatus, note }: { id: string; newStatus: string; note?: string }) =>
      commentsAdmin.moderate(id, newStatus, note),
    onSuccess: (_, { newStatus }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'comments'] });
      toast.success(`Comment ${newStatus}`);
    },
    onError: () => toast.error('Failed to update comment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsAdmin.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'comments'] });
      setDeleteTarget(null);
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleModerate = (comment: Comment, newStatus: string) => {
    const note = moderationNote[comment._id] || '';
    moderateMutation.mutate({ id: comment._id, newStatus, note });
    setExpandedNote(null);
  };

  const pendingCount = status === 'pending' ? meta?.total : undefined;

  // ── Status tab counts (derive from current filter when matching) ────────────
  const tabCounts: Record<string, number | undefined> = {
    pending: status === 'pending' ? meta?.total : undefined,
    flagged: status === 'flagged' ? meta?.total : undefined,
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold font-sans text-ink">Comment Moderation</h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {meta?.total !== undefined
              ? `${meta.total.toLocaleString()} comment${meta.total !== 1 ? 's' : ''} ${status ? `· ${status}` : ''}`
              : 'Loading…'}
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'comments'] })}
          disabled={isFetching}
          className="admin-btn-secondary text-xs gap-1.5 py-1.5"
        >
          <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Status Tabs + Search ── */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-200 px-2 overflow-x-auto">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatus(f.value); setPage(1); }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-3 text-xs font-semibold font-sans whitespace-nowrap border-b-2 -mb-px transition-colors',
                status === f.value
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-ink-muted hover:text-ink'
              )}
            >
              {f.label}
              {f.value === 'pending' && tabCounts.pending !== undefined && tabCounts.pending > 0 && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {tabCounts.pending}
                </span>
              )}
              {f.value === 'flagged' && tabCounts.flagged !== undefined && tabCounts.flagged > 0 && (
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {tabCounts.flagged}
                </span>
              )}
            </button>
          ))}

          <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2 py-2 pr-2 flex-shrink-0">
            <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-1.5">
              <Search size={12} className="text-ink-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search comment text…"
                className="text-xs font-sans outline-none w-48 bg-transparent text-ink placeholder:text-ink-muted"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
                  className="text-ink-muted hover:text-ink">
                  <XCircle size={12} />
                </button>
              )}
            </div>
            {searchInput !== search && (
              <button type="submit" className="admin-btn-primary text-xs py-1.5">Search</button>
            )}
          </form>
        </div>

        {/* ── Comments list ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-ink-muted">
            <Loader size={18} className="animate-spin" />
            <span className="text-sm font-sans">Loading comments…</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-ink-muted">
            <MessageSquare size={28} className="opacity-30" />
            <p className="text-sm font-sans">
              {search ? `No comments matching "${search}"` : `No ${status || ''} comments`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {comments.map((comment) => (
              <CommentRow
                key={comment._id}
                comment={comment}
                moderationNote={moderationNote[comment._id] || ''}
                onNoteChange={(val) => setModerationNote(n => ({ ...n, [comment._id]: val }))}
                expandedNote={expandedNote}
                onToggleNote={(id) => setExpandedNote(v => v === id ? null : id)}
                onModerate={handleModerate}
                onDelete={() => setDeleteTarget(comment)}
                isUpdating={moderateMutation.isPending && moderateMutation.variables?.id === comment._id}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-surface-secondary">
            <p className="text-xs text-ink-muted font-sans">
              Page {meta.page} of {meta.totalPages} · {meta.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
                className="admin-btn-secondary py-1.5 text-xs gap-1"
              >
                <ChevronLeft size={13} /> Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNextPage}
                className="admin-btn-secondary py-1.5 text-xs gap-1"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Comment"
        message={`Permanently delete this comment by ${deleteTarget?.author?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ── Comment Row component ────────────────────────────────────────────────────

interface CommentRowProps {
  comment: Comment;
  moderationNote: string;
  onNoteChange: (val: string) => void;
  expandedNote: string | null;
  onToggleNote: (id: string) => void;
  onModerate: (comment: Comment, status: string) => void;
  onDelete: () => void;
  isUpdating: boolean;
}

function CommentRow({
  comment, moderationNote, onNoteChange, expandedNote,
  onToggleNote, onModerate, onDelete, isUpdating
}: CommentRowProps) {
  const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000';
  const articleUrl = comment.article?.slug
    ? `${CLIENT_URL}/article/${comment.article.slug}`
    : null;

  const isExpanded = expandedNote === comment._id;

  return (
    <div className={cn(
      'px-5 py-4 transition-colors',
      isUpdating ? 'opacity-60 pointer-events-none' : 'hover:bg-surface-secondary/60',
      comment.status === 'pending' && 'border-l-2 border-l-amber-300',
      comment.status === 'flagged' && 'border-l-2 border-l-orange-400',
      comment.reportCount > 2 && 'bg-orange-50/40',
    )}>
      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {comment.author?.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-brand-navy text-brand-yellow flex items-center justify-center text-sm font-bold">
              {comment.author?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-sm font-semibold text-ink">{comment.author?.name}</span>
            {comment.author?.email && (
              <span className="text-xs text-ink-muted">{comment.author.email}</span>
            )}
            <StatusBadge status={comment.status} />
            {comment.parentComment && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                Reply
              </span>
            )}
            {comment.isEdited && (
              <span className="text-[10px] text-ink-faint italic">edited</span>
            )}
            {comment.reportCount > 0 && (
              <span className={cn(
                'text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded',
                comment.reportCount >= 3
                  ? 'bg-red-100 text-red-600'
                  : 'bg-orange-100 text-orange-600'
              )}>
                <Flag size={9} /> {comment.reportCount} report{comment.reportCount > 1 ? 's' : ''}
              </span>
            )}
            <span className="text-xs text-ink-faint ml-auto whitespace-nowrap">
              {formatRelative(comment.createdAt)}
            </span>
          </div>

          {/* Comment text */}
          <p className="text-sm text-ink-secondary leading-relaxed">{comment.body}</p>

          {/* Article link */}
          {comment.article && (
            <div className="flex items-center gap-1.5 mt-2">
              <MessageSquare size={11} className="text-ink-faint flex-shrink-0" />
              <span className="text-xs text-ink-muted truncate max-w-xs">
                On: <span className="font-medium text-ink">{comment.article.title}</span>
              </span>
              {articleUrl && (
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-muted hover:text-brand-navy transition-colors flex-shrink-0"
                  title="View article"
                >
                  <ExternalLink size={11} />
                </a>
              )}
            </div>
          )}

          {/* Moderation note input (expandable) */}
          {isExpanded && (
            <div className="mt-3">
              <textarea
                value={moderationNote}
                onChange={e => onNoteChange(e.target.value)}
                placeholder="Add a moderation note (optional)…"
                rows={2}
                className="w-full text-xs border border-gray-200 px-3 py-2 outline-none focus:border-brand-navy font-sans resize-none"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {isUpdating ? (
            <Loader size={14} className="animate-spin text-ink-muted" />
          ) : (
            <>
              {/* Approve */}
              <button
                onClick={() => onModerate(comment, 'approved')}
                disabled={comment.status === 'approved'}
                title="Approve"
                className="p-1.5 rounded text-accent-green hover:bg-green-50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle size={16} />
              </button>

              {/* Reject */}
              <button
                onClick={() => onModerate(comment, 'rejected')}
                disabled={comment.status === 'rejected'}
                title="Reject"
                className="p-1.5 rounded text-accent-red hover:bg-red-50 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              >
                <XCircle size={16} />
              </button>

              {/* Flag */}
              <button
                onClick={() => onModerate(comment, 'flagged')}
                disabled={comment.status === 'flagged'}
                title="Flag for review"
                className={cn(
                  'p-1.5 rounded transition-colors disabled:opacity-25 disabled:cursor-not-allowed',
                  comment.status === 'flagged'
                    ? 'text-orange-500'
                    : 'text-ink-muted hover:text-orange-500 hover:bg-orange-50'
                )}
              >
                <Flag size={15} />
              </button>

              {/* Note toggle */}
              <button
                onClick={() => onToggleNote(comment._id)}
                title="Add moderation note"
                className={cn(
                  'p-1.5 rounded transition-colors text-xs font-bold',
                  isExpanded
                    ? 'bg-brand-navy text-brand-yellow'
                    : 'text-ink-muted hover:bg-gray-100'
                )}
              >
                N
              </button>

              {/* Delete */}
              <button
                onClick={onDelete}
                title="Delete permanently"
                className="p-1.5 rounded text-ink-muted hover:text-accent-red hover:bg-red-50 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
