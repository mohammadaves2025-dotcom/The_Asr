import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { categoriesAdmin } from '../services/admin';
import ConfirmModal from '../components/common/ConfirmModal';
import { cn } from '../utils/helpers';
import toast from 'react-hot-toast';
import type { Category } from '../types';

const COLORS = ['#c8392b', '#1d3557', '#1a5c38', '#7c3aed', '#b45309', '#0e7490', '#be123c', '#065f46', '#374151', '#1e3a5f', '#122837', '#9a3412'];

const EMPTY_FORM = { name: '', description: '', color: '#122837', isFeatured: false, order: 0 };

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesAdmin.getAll(),
  });

  const categories = (data?.data?.data?.categories || []) as Category[];

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => categoriesAdmin.create(data),
    onSuccess: () => {
      toast.success('Category created');
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error('Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) => categoriesAdmin.update(id, data),
    onSuccess: () => {
      toast.success('Category updated');
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setEditTarget(null);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error('Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesAdmin.delete(id),
    onSuccess: () => {
      toast.success('Category deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete category'),
  });

  const startEdit = (cat: Category) => {
    setEditTarget(cat);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color, isFeatured: cat.isFeatured, order: cat.order });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      updateMutation.mutate({ id: editTarget._id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-sans text-ink-muted">{categories.length} categories</p>
        <button
          onClick={() => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(!showForm); }}
          className="admin-btn-primary text-xs gap-2"
        >
          <Plus size={14} /> New Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold font-sans text-ink mb-4">{editTarget ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
                required
              />
            </div>
            <div>
              <label className="admin-label">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm({ ...form, color: c })}
                    className={cn('w-7 h-7 rounded-full transition-transform', form.color === c && 'scale-125 ring-2 ring-offset-1 ring-gray-400')}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer" />
              </div>
            </div>
            <div>
              <label className="admin-label">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="admin-input"
                min={0}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isFeatured" className="text-sm font-sans text-ink">Show in featured navigation</label>
            </div>
            <div className="sm:col-span-2 flex gap-2">
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="admin-btn-primary text-xs">
                {editTarget ? 'Update Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditTarget(null); setForm(EMPTY_FORM); }}
                className="admin-btn-secondary text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="admin-card p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded mb-2" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))
        ) : categories.map((cat) => (
          <div key={cat._id} className="admin-card p-4 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-3 h-full min-h-10 flex-shrink-0 rounded-sm" style={{ backgroundColor: cat.color }} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-ink font-sans">{cat.name}</p>
                  {cat.isFeatured && (
                    <span className="text-[10px] font-bold bg-brand-navy/10 text-brand-navy px-1.5 py-0.5 uppercase tracking-wide">Featured</span>
                  )}
                </div>
                {cat.description && <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{cat.description}</p>}
                <p className="text-xs text-ink-faint mt-1">Order: {cat.order} · /{cat.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => startEdit(cat)} className="p-1.5 text-ink-muted hover:text-brand-navy transition-colors" title="Edit">
                <Edit size={13} />
              </button>
              <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-ink-muted hover:text-accent-red transition-colors" title="Delete">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Articles in this category will need a new category.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
