import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CreditCard as Edit, Trash2, Monitor, ChevronDown, EyeOff } from 'lucide-react';
import { categoriesAdmin } from '../services/admin';
import ConfirmModal from '../components/common/ConfirmModal';
import { cn } from '../utils/helpers';
import toast from 'react-hot-toast';
import type { Category } from '../types';

const COLORS = ['#c8392b', '#1d3557', '#1a5c38', '#7c3aed', '#b45309', '#0e7490', '#be123c', '#065f46', '#374151', '#1e3a5f', '#122837', '#9a3412'];

const EMPTY_FORM = {
  name: '',
  description: '',
  color: '#122837',
  isFeatured: false,
  showInMore: false,
  isActive: true,
  order: 0,
};

// Placement badge shown on each category card
function PlacementBadge({ cat }: { cat: Category }) {
  if (!cat.isActive) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
        <EyeOff size={9} /> Hidden
      </span>
    );
  }
  if (cat.isFeatured) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-navy text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
        <Monitor size={9} /> Navbar
      </span>
    );
  }
  if (cat.showInMore) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-yellow/20 text-brand-navy px-2 py-0.5 rounded-full uppercase tracking-wide">
        <ChevronDown size={9} /> More
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wide">
      Unlisted
    </span>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Use admin/all endpoint so we get ALL categories including inactive
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => categoriesAdmin.adminGetAll ? categoriesAdmin.adminGetAll() : categoriesAdmin.getAll(),
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
      setShowForm(false);
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
    setForm({
      name: cat.name,
      description: cat.description || '',
      color: cat.color,
      isFeatured: cat.isFeatured,
      showInMore: cat.showInMore ?? false,
      isActive: cat.isActive,
      order: cat.order,
    });
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

  // Mutual exclusivity: selecting one nav placement clears the other
  const setNavPlacement = (field: 'isFeatured' | 'showInMore', checked: boolean) => {
    if (field === 'isFeatured') {
      setForm({ ...form, isFeatured: checked, showInMore: checked ? false : form.showInMore });
    } else {
      setForm({ ...form, showInMore: checked, isFeatured: checked ? false : form.isFeatured });
    }
  };

  // Stats for summary row
  const navbarCount  = categories.filter(c => c.isFeatured && c.isActive).length;
  const moreCount    = categories.filter(c => c.showInMore && c.isActive).length;
  const hiddenCount  = categories.filter(c => !c.isActive).length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-xs font-sans text-ink-muted">{categories.length} categories</p>
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-sans text-ink-muted">
            <span className="flex items-center gap-1"><Monitor size={11} className="text-brand-navy" /> {navbarCount} in navbar</span>
            <span className="flex items-center gap-1"><ChevronDown size={11} className="text-brand-navy" /> {moreCount} in More</span>
            {hiddenCount > 0 && <span className="flex items-center gap-1 text-gray-400"><EyeOff size={11} /> {hiddenCount} hidden</span>}
          </div>
        </div>
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
            {/* Name */}
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

            {/* Description */}
            <div>
              <label className="admin-label">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-input"
              />
            </div>

            {/* Color */}
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
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-7 h-7 rounded-full border-0 p-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Display Order */}
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

            {/* Navigation Placement — full width, visually grouped */}
            <div className="sm:col-span-2">
              <label className="admin-label mb-2 block">Navigation Placement</label>
              <div className="grid sm:grid-cols-3 gap-3">

                {/* Primary Navbar */}
                <label className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  form.isFeatured
                    ? 'border-brand-navy bg-brand-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}>
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setNavPlacement('isFeatured', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-brand-navy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <Monitor size={13} className="text-brand-navy" /> Primary Navbar
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">Appears directly in the top navigation bar.</p>
                  </div>
                </label>

                {/* More Dropdown */}
                <label className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  form.showInMore
                    ? 'border-brand-navy bg-brand-navy/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}>
                  <input
                    type="checkbox"
                    checked={form.showInMore}
                    onChange={(e) => setNavPlacement('showInMore', e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-brand-navy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <ChevronDown size={13} className="text-brand-navy" /> More Dropdown
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">Appears under the "More" menu on desktop & mobile.</p>
                  </div>
                </label>

                {/* Active toggle */}
                <label className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  !form.isActive
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="mt-0.5 w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
                      <EyeOff size={13} className="text-gray-400" /> Active
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">Uncheck to hide from public entirely.</p>
                  </div>
                </label>

              </div>
              {form.isFeatured && form.showInMore && (
                <p className="text-[11px] text-amber-600 mt-2 font-sans">
                  ⚠ A category can only appear in one place. "More Dropdown" will be cleared on save.
                </p>
              )}
            </div>

            {/* Actions */}
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
          <div
            key={cat._id}
            className={cn(
              'admin-card p-4 flex items-start justify-between gap-3 transition-opacity',
              !cat.isActive && 'opacity-50'
            )}
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-3 h-full min-h-10 flex-shrink-0 rounded-sm" style={{ backgroundColor: cat.color }} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-semibold text-ink font-sans">{cat.name}</p>
                  <PlacementBadge cat={cat} />
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
