import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Eye, Trash2, Star, Zap, CircleCheck as CheckCircle } from 'lucide-react';
import { articlesAdmin } from '../services/admin';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatRelative, cn } from '../utils/helpers';
import toast from 'react-hot-toast';
import type { Article } from '../types';

const STATUS_OPTIONS = ['', 'draft', 'review', 'published', 'scheduled', 'archived'];

export default function ArticlesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'articles', { search, status, page }],
    queryFn: () => articlesAdmin.getAll({ search: search || undefined, status: status || undefined, page, limit: 20 }),
  });

  const articles = data?.data?.data?.articles || [];
  const meta = data?.data?.meta;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesAdmin.delete(id),
    onSuccess: () => {
      toast.success('Article deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete article'),
  });

  const toggleFlag = async (article: Article, field: 'isFeatured' | 'isBreaking' | 'isEditorsPick') => {
    try {
      await articlesAdmin.update(article._id, { [field]: !article[field] });
      toast.success('Updated');
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
    } catch {
      toast.error('Failed to update');
    }
  };

  const changeStatus = async (article: Article, newStatus: string) => {
    try {
      await articlesAdmin.update(article._id, { status: newStatus as Article['status'] });
      toast.success(`Status changed to ${newStatus}`);
      qc.invalidateQueries({ queryKey: ['admin', 'articles'] });
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-sans text-ink-muted">{meta?.total || 0} total articles</p>
        </div>
        <Link
          to="/articles/new"
          className="admin-btn-primary gap-2 text-xs"
        >
          <Plus size={14} /> New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 flex-1 min-w-0 max-w-xs">
          <Search size={14} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search articles..."
            className="text-sm font-sans outline-none flex-1 bg-transparent text-ink placeholder:text-ink-muted"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="admin-select w-auto min-w-[120px] text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Article</th>
                <th className="table-th">Author</th>
                <th className="table-th">Category</th>
                <th className="table-th">Status</th>
                <th className="table-th">Views</th>
                <th className="table-th">Updated</th>
                <th className="table-th">Flags</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="table-td">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : articles.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center text-ink-muted py-8">No articles found</td></tr>
              ) : articles.map((article) => (
                <tr key={article._id} className="table-row">
                  <td className="table-td max-w-xs">
                    <div className="flex items-start gap-2.5">
                      {article.featuredImage?.url && (
                        <img src={article.featuredImage.url} alt="" className="w-12 h-8 object-cover flex-shrink-0 bg-gray-100" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-ink line-clamp-2 text-sm">{article.title}</p>
                        <p className="text-xs text-ink-muted mt-0.5">{article.contentType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-ink-muted whitespace-nowrap">{article.author.name}</td>
                  <td className="table-td">
                    {typeof article.category === 'object' && article.category ? (
                      <span
                        className="text-xs font-bold font-sans px-1.5 py-0.5"
                        style={{ color: article.category.color, backgroundColor: (article.category.color || '#000') + '18' }}
                      >
                        {article.category.name}
                      </span>
                    ) : (
                      <span className="text-xs font-bold font-sans px-1.5 py-0.5">{article.category as string}</span>
                    )}
                  </td>
                  <td className="table-td">
                    <select
                      value={article.status}
                      onChange={(e) => changeStatus(article, e.target.value)}
                      className="text-xs border border-gray-200 py-1 px-2 outline-none font-sans"
                    >
                      {STATUS_OPTIONS.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="table-td text-ink-muted whitespace-nowrap">
                    <span className="flex items-center gap-1"><Eye size={12} /> {article.views.toLocaleString()}</span>
                  </td>
                  <td className="table-td text-ink-muted whitespace-nowrap text-xs">{formatRelative(article.updatedAt)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFlag(article, 'isFeatured')}
                        title="Featured"
                        className={cn('p-1 rounded transition-colors', article.isFeatured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400')}
                      >
                        <Star size={13} fill={article.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => toggleFlag(article, 'isBreaking')}
                        title="Breaking"
                        className={cn('p-1 rounded transition-colors', article.isBreaking ? 'text-accent-red' : 'text-gray-300 hover:text-red-400')}
                      >
                        <Zap size={13} fill={article.isBreaking ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => toggleFlag(article, 'isEditorsPick')}
                        title="Editor's Pick"
                        className={cn('p-1 rounded transition-colors', article.isEditorsPick ? 'text-accent-green' : 'text-gray-300 hover:text-green-400')}
                      >
                        <CheckCircle size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/articles/${article._id}/edit`}
                        className="p-1.5 text-ink-muted hover:text-brand-navy transition-colors"
                        title="Edit"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </Link>
                      <a
                        href={`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}/article/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-ink-muted hover:text-brand-navy transition-colors"
                        title="View on site"
                      >
                        <Eye size={14} />
                      </a>
                      <button
                        onClick={() => setDeleteTarget(article)}
                        className="p-1.5 text-ink-muted hover:text-accent-red transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
            <p className="text-xs text-ink-muted font-sans">
              Page {meta.page} of {meta.totalPages} ({meta.total} results)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
                className="admin-btn-secondary py-1.5 text-xs"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!meta.hasNextPage}
                className="admin-btn-secondary py-1.5 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Article"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}