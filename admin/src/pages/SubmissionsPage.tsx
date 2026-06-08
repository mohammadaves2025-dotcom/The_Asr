import { useState, useEffect, useCallback } from 'react';
import {
  Inbox, CheckCircle, XCircle, BookOpen, Clock,
  ChevronDown, ChevronUp, Mail, RefreshCw, Filter,
} from 'lucide-react';
import { submissionsAdmin } from '../services/admin';
import type { Submission } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: string; label: string; icon: React.ReactNode }[] = [
  { value: 'new',          label: 'New',          icon: <Inbox size={14} />        },
  { value: 'under-review', label: 'Under Review', icon: <Clock size={14} />        },
  { value: 'accepted',     label: 'Accepted',     icon: <CheckCircle size={14} />  },
  { value: 'rejected',     label: 'Rejected',     icon: <XCircle size={14} />      },
  { value: 'published',    label: 'Published',    icon: <BookOpen size={14} />     },
  { value: '',             label: 'All',          icon: <Filter size={14} />       },
];

const TYPE_LABELS: Record<string, string> = {
  'tip':               'News Tip',
  'community-voice':   'Community Voice',
  'letter-to-editor':  'Letter to Editor',
  'youth-writer':      'Youth Writer',
  'correction':        'Correction',
  'contact':           'Contact',
};

const STATUS_STYLES: Record<string, string> = {
  'new':          'bg-blue-100 text-blue-700',
  'under-review': 'bg-yellow-100 text-yellow-700',
  'accepted':     'bg-green-100 text-green-700',
  'rejected':     'bg-red-100 text-red-700',
  'published':    'bg-purple-100 text-purple-700',
};

const NEXT_ACTIONS: Record<string, { label: string; status: string; style: string }[]> = {
  'new':          [{ label: 'Start Review', status: 'under-review', style: 'bg-yellow-500 hover:bg-yellow-600 text-white' }, { label: 'Reject', status: 'rejected', style: 'bg-red-100 hover:bg-red-200 text-red-700' }],
  'under-review': [{ label: 'Accept',       status: 'accepted',     style: 'bg-green-500 hover:bg-green-600 text-white'  }, { label: 'Reject', status: 'rejected', style: 'bg-red-100 hover:bg-red-200 text-red-700' }],
  'accepted':     [{ label: 'Mark Published', status: 'published',  style: 'bg-purple-500 hover:bg-purple-600 text-white' }],
  'rejected':     [{ label: 'Reopen',       status: 'under-review', style: 'bg-yellow-500 hover:bg-yellow-600 text-white' }],
  'published':    [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubmissionRow({
  sub,
  onStatusChange,
}: {
  sub: Submission;
  onStatusChange: (id: string, status: string, notes?: string) => Promise<void>;
}) {
  const [open, setOpen]         = useState(false);
  const [notes, setNotes]       = useState(sub.reviewNotes ?? '');
  const [saving, setSaving]     = useState(false);

  const handleAction = async (status: string) => {
    setSaving(true);
    await onStatusChange(sub._id, status, notes);
    setSaving(false);
  };

  const actions = NEXT_ACTIONS[sub.status] ?? [];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Row header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className="mt-0.5 text-ink-muted flex-shrink-0">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted bg-gray-100 px-2 py-0.5 rounded">
              {TYPE_LABELS[sub.type] ?? sub.type}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_STYLES[sub.status]}`}>
              {sub.status.replace('-', ' ')}
            </span>
          </div>
          <p className="text-sm font-semibold text-ink truncate">{sub.subject}</p>
          <p className="text-xs text-ink-muted font-sans mt-0.5">
            {sub.name} · {sub.email} · {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 bg-gray-50/50">
          {/* Full message */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">Message</p>
            <p className="text-sm text-ink font-sans leading-relaxed whitespace-pre-wrap">{sub.body}</p>
          </div>

          {/* Review notes */}
          <div>
            <label className="admin-label">Internal Review Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="admin-input resize-none"
              placeholder="Add notes for your team (not visible to submitter)…"
            />
          </div>

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-2">
            {actions.map(action => (
              <button
                key={action.status}
                disabled={saving}
                onClick={() => handleAction(action.status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors disabled:opacity-60 ${action.style}`}
              >
                {saving ? 'Saving…' : action.label}
              </button>
            ))}

            <a
              href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject)}`}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-muted border border-gray-200 rounded hover:bg-white transition-colors"
            >
              <Mail size={12} /> Reply via Email
            </a>
          </div>

          {sub.assignedTo && (
            <p className="text-[11px] text-ink-muted font-sans">
              Assigned to: <span className="font-semibold text-ink">{sub.assignedTo.name}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubmissionsPage() {
  const [activeStatus, setActiveStatus]     = useState('new');
  const [typeFilter, setTypeFilter]         = useState('');
  const [submissions, setSubmissions]       = useState<Submission[]>([]);
  const [total, setTotal]                   = useState(0);
  const [page, setPage]                     = useState(1);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const LIMIT = 20;

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, any> = { page, limit: LIMIT };
      if (activeStatus) params.status = activeStatus;
      if (typeFilter)   params.type   = typeFilter;
      const res = await submissionsAdmin.getAll(params);
      const d = (res.data as any)?.data;
      setSubmissions(d?.submissions ?? []);
      setTotal(d?.meta?.total ?? 0);
    } catch {
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeStatus, typeFilter, page]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [activeStatus, typeFilter]);

  const handleStatusChange = async (id: string, status: string, reviewNotes?: string) => {
    await submissionsAdmin.updateStatus(id, status, reviewNotes);
    // Optimistic: remove from current list if status no longer matches the tab
    if (activeStatus && status !== activeStatus) {
      setSubmissions(prev => prev.filter(s => s._id !== id));
      setTotal(t => t - 1);
    } else {
      // Refresh to get updated data
      fetchSubmissions();
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink">Submissions</h1>
          <p className="text-sm text-ink-muted font-sans mt-0.5">
            Manage reader tips, letters, corrections and contact messages
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink-muted border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeStatus === tab.value
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Type filter + count */}
      <div className="flex items-center justify-between mb-4">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="admin-input !w-auto text-sm py-1.5"
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {!loading && (
          <p className="text-xs text-ink-muted font-sans">
            {total} {total === 1 ? 'submission' : 'submissions'}
          </p>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-600 font-sans text-sm">{error}</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20">
          <Inbox size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-ink-muted font-sans text-sm">
            No {activeStatus.replace('-', ' ')} submissions{typeFilter ? ` of type "${TYPE_LABELS[typeFilter]}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map(sub => (
            <SubmissionRow key={sub._id} sub={sub} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="admin-btn-primary disabled:opacity-40 text-xs px-3 py-1.5"
          >
            Previous
          </button>
          <span className="text-xs text-ink-muted font-sans">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="admin-btn-primary disabled:opacity-40 text-xs px-3 py-1.5"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}