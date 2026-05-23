import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheck as CheckCircle, Circle as XCircle, Trash2, Flag } from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import { formatRelative } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CommentsPage() {
  const qc = useQueryClient();
  const [articleId, setArticleId] = useState('');
  const [inputId, setInputId] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'comments', articleId],
    queryFn: () => api.get(`/articles/${articleId}/comments?limit=50`),
    enabled: articleId.length === 24,
  });

  const comments = (data?.data?.data?.comments || []) as any[];

  const moderate = useMutation({
    mutationFn: ({ commentId, status }: { commentId: string; status: string }) =>
      api.patch(`/articles/${articleId}/comments/${commentId}/moderate`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'comments', articleId] });
      toast.success('Comment updated');
    },
    onError: () => toast.error('Failed to update comment'),
  });

  const deleteComment = useMutation({
    mutationFn: (commentId: string) =>
      api.delete(`/articles/${articleId}/comments/${commentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'comments', articleId] });
      toast.success('Comment deleted');
    },
    onError: () => toast.error('Failed to delete comment'),
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Article ID input */}
      <div className="admin-card p-5">
        <p className="text-sm font-semibold font-sans text-ink mb-3">Load comments by Article ID</p>
        <div className="flex gap-3">
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="MongoDB ObjectId (24 chars)"
            className="admin-input flex-1 max-w-xs"
          />
          <button
            onClick={() => setArticleId(inputId)}
            disabled={inputId.length !== 24}
            className="admin-btn-primary text-xs"
          >
            Load Comments
          </button>
        </div>
      </div>

      {/* Comments */}
      {articleId && (
        <div className="admin-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold font-sans text-ink">
              Comments ({comments.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-5 text-center text-ink-muted text-sm font-sans">Loading...</div>
          ) : comments.length === 0 ? (
            <div className="p-10 text-center text-ink-muted text-sm font-sans">No comments found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {comments.map((comment) => (
                <div key={comment._id} className="px-5 py-4 hover:bg-surface-secondary transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {comment.author?.avatar ? (
                        <img src={comment.author.avatar} alt={comment.author.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-yellow flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {comment.author?.name?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-ink">{comment.author?.name}</span>
                          <StatusBadge status={comment.status} />
                          {comment.reportCount > 0 && (
                            <span className="text-[11px] font-bold text-orange-500 flex items-center gap-0.5">
                              <Flag size={10} /> {comment.reportCount} reports
                            </span>
                          )}
                          <span className="text-xs text-ink-muted">{formatRelative(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">{comment.body}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => moderate.mutate({ commentId: comment._id, status: 'approved' })}
                        disabled={comment.status === 'approved'}
                        className="p-1.5 text-accent-green hover:bg-green-50 transition-colors disabled:opacity-30"
                        title="Approve"
                      >
                        <CheckCircle size={15} />
                      </button>
                      <button
                        onClick={() => moderate.mutate({ commentId: comment._id, status: 'rejected' })}
                        disabled={comment.status === 'rejected'}
                        className="p-1.5 text-accent-red hover:bg-red-50 transition-colors disabled:opacity-30"
                        title="Reject"
                      >
                        <XCircle size={15} />
                      </button>
                      <button
                        onClick={() => deleteComment.mutate(comment._id)}
                        className="p-1.5 text-ink-muted hover:text-accent-red transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
