import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CornerDownRight, Loader2 } from 'lucide-react';
import { articlesService } from '../../services/articles';
import { useAuth } from '../../context/AuthContext';
import { formatRelative } from '../../utils/helpers';

interface Comment {
  _id: string;
  body: string;
  author: { _id: string; name: string; avatar?: string };
  isApproved: boolean;
  createdAt: string;
  parentComment?: string;
  replies?: Comment[];
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({
  name,
  avatar,
  size = 8,
}: {
  name: string;
  avatar?: string;
  size?: number;
}) {
  const s = `w-${size} h-${size}`;
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        className={`${s} rounded-full object-cover flex-shrink-0`}
      />
    );
  return (
    <div
      className={`${s} rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-brand-yellow font-bold text-[10px]">
        {name?.[0] ?? '?'}
      </span>
    </div>
  );
}

// ── Single comment + nested replies ──────────────────────────────────────────
function CommentItem({
  comment,
  articleId,
  depth = 0,
}: {
  comment: Comment;
  articleId: string;
  depth?: number;
}) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const qc = useQueryClient();

  const replyMutation = useMutation({
    mutationFn: (body: string) =>
      articlesService.addComment(articleId, {
        body,
        parentComment: comment._id,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', articleId] });
      setReplyText('');
      setReplyOpen(false);
    },
  });

  // ── Reply submit — gate if not logged in ─────────────────────────────────
  const handleReplySubmit = () => {
    if (!isAuthenticated) {
      // Store current article path so we return here after login
      sessionStorage.setItem(
        'oauthReturnTo',
        window.location.pathname + window.location.search
      );
      navigate('/login');
      return;
    }
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText.trim());
  };

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}>
      <div className="flex gap-3 py-4">
        <Avatar name={comment.author?.name ?? 'Anon'} avatar={comment.author?.avatar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[13px] font-semibold text-ink font-sans">
              {comment.author?.name}
            </span>
            <span className="text-[10px] text-ink-muted font-sans">
              {formatRelative(comment.createdAt)}
            </span>
          </div>
          <p className="text-[14px] text-ink-secondary font-sans leading-relaxed">
            {comment.body}
          </p>
          {depth === 0 && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-muted hover:text-brand-navy transition-colors mt-2 font-sans"
            >
              <CornerDownRight size={11} /> Reply
            </button>
          )}
          {replyOpen && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply…"
                rows={2}
                className="w-full border border-gray-200 px-3 py-2 text-sm font-sans text-ink placeholder:text-ink-muted outline-none focus:border-brand-navy transition-colors resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReplySubmit}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="btn-primary py-1.5 px-4 text-[10px] disabled:opacity-60"
                >
                  {replyMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    'Post Reply'
                  )}
                </button>
                <button
                  onClick={() => {
                    setReplyOpen(false);
                    setReplyText('');
                  }}
                  className="text-[10px] text-ink-muted hover:text-ink font-sans uppercase tracking-[1.5px] font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply._id}
          comment={reply}
          articleId={articleId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

// ── Main comments section ─────────────────────────────────────────────────────
export default function CommentsSection({ articleId }: { articleId: string }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: () => articlesService.getComments(articleId),
    staleTime: 2 * 60 * 1000,
  });

  const comments: Comment[] =
    (data?.data as any)?.data?.comments ?? [];

  const postMutation = useMutation({
    mutationFn: (body: string) =>
      articlesService.addComment(articleId, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', articleId] });
      setCommentText('');
    },
  });

  // ── Main comment submit — gate redirects to Google login ─────────────────
  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isAuthenticated) {
      // Preserve where to return after OAuth completes
      sessionStorage.setItem(
        'oauthReturnTo',
        window.location.pathname + window.location.search
      );
      // Redirect to backend Google OAuth — same flow as GoogleCallbackPage
      window.location.href = `${
        import.meta.env.VITE_API_URL ?? ''
      }/api/v1/auth/google`;
      return;
    }

    postMutation.mutate(commentText.trim());
  };

  return (
    <section className="mt-12 pt-8 border-t-2 border-ink">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={16} className="text-ink" />
        <h2 className="font-serif font-bold text-xl text-ink">
          Comments{comments.length > 0 ? ` (${comments.length})` : ''}
        </h2>
      </div>

      {/* ── Comment form ─────────────────────────────────────────────────── */}
      {/*
        Form is shown to EVERYONE — logged-in or not.
        If not logged in, clicking "Post Comment" triggers Google OAuth redirect.
        This is the UX your client requested:
        - User writes comment → clicks Submit → redirected to sign in → returns to article
      */}
      <form onSubmit={handlePost} className="mb-8">
        <div className="flex gap-3">
          {/* Show avatar if logged in, placeholder initials box if not */}
          {isAuthenticated && user ? (
            <Avatar name={user.name ?? ''} avatar={user.avatar} size={9} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={14} className="text-ink-muted" />
            </div>
          )}

          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                isAuthenticated
                  ? 'Share your thoughts on this article…'
                  : "Write a comment… (you'll be asked to sign in when you submit)"
              }
              rows={3}
              className="w-full border border-gray-200 px-4 py-3 text-sm font-sans text-ink placeholder:text-ink-muted outline-none focus:border-brand-navy transition-colors resize-none"
            />
            <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
              {/* Hint for non-logged-in users */}
              {!isAuthenticated ? (
                <p className="text-[10px] text-ink-muted font-sans">
                  You'll be asked to sign in with Google before your comment is posted.
                </p>
              ) : (
                <p className="text-[10px] text-ink-muted font-sans">
                  Comments are moderated and may take a moment to appear.
                </p>
              )}

              <button
                type="submit"
                disabled={!commentText.trim() || postMutation.isPending}
                className="btn-primary py-2 px-5 disabled:opacity-60 flex-shrink-0"
              >
                {postMutation.isPending ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Posting…
                  </>
                ) : (
                  'Post Comment'
                )}
              </button>
            </div>

            {postMutation.isSuccess && (
              <p className="text-[11px] text-green-600 font-sans mt-1">
                Your comment has been submitted for moderation.
              </p>
            )}
            {postMutation.isError && (
              <p className="text-[11px] text-red-500 font-sans mt-1">
                Failed to post comment. Please try again.
              </p>
            )}
          </div>
        </div>
      </form>

      {/* ── Comment list ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 py-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 w-24 rounded" />
                <div className="h-3 bg-gray-200 w-full rounded" />
                <div className="h-3 bg-gray-200 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && comments.length === 0 && (
        <div className="text-center py-10 border border-dashed border-gray-200">
          <MessageSquare size={24} className="text-ink-faint mx-auto mb-2" />
          <p className="text-[13px] text-ink-muted font-sans">
            Be the first to comment on this article.
          </p>
        </div>
      )}

      {!isLoading && comments.length > 0 && (
        <div className="divide-y divide-gray-100">
          {comments
            .filter((c) => !c.parentComment && c.isApproved !== false)
            .map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                articleId={articleId}
              />
            ))}
        </div>
      )}
    </section>
  );
}