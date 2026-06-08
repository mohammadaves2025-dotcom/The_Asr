import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX, Edit2, X, Save, Loader2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { usersAdmin } from '../services/admin';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate, cn, ROLE_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AuthContext';
import api from '../services/api';
import type { User } from '../types';

const ROLES = ['', 'subscriber', 'contributor', 'editor', 'admin', 'superadmin'];
const CREATE_ROLES = ['contributor', 'editor', 'admin'] as const;

type UserRole = 'subscriber' | 'contributor' | 'editor' | 'admin' | 'superadmin';

// ── Extend the admin User type with fields we're now editing ──────────────
interface AuthorProfile extends User {
  bio?: string;
  socialLinks?: {
    twitter?:   string;
    linkedin?:  string;
    website?:   string;
    instagram?: string;
    facebook?:  string;
    youtube?:   string;
  };
}

// ── Reusable verified badge ─────────────────────────────────────────────────
function VerifiedBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 flex-shrink-0',
        className
      )}
    >
      <svg viewBox="0 0 24 24" width="8" height="8" fill="white">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
      </svg>
    </span>
  );
}

// ── Create User Modal ───────────────────────────────────────────────────────
function CreateUserModal({ currentUserRole, onClose, onCreated }: { currentUserRole: string; onClose: () => void; onCreated: () => void }) {
  // Admins can create contributor/editor; superadmin can also create admin
  const availableRoles: typeof CREATE_ROLES[number][] =
    currentUserRole === 'superadmin'
      ? ['contributor', 'editor', 'admin']
      : ['contributor', 'editor'];
  const [form, setForm] = useState({
    name:        '',
    email:       '',
    password:    '',
    role:        'contributor',
    designation: '',
    bio:         '',
    avatar:      '',
    twitter:     '',
    linkedin:    '',
    website:     '',
    instagram:   '',
    facebook:    '',
    youtube:     '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await usersAdmin.create({
        name:        form.name,
        email:       form.email,
        password:    form.password,
        role:        form.role as UserRole,
        designation: form.designation || undefined,
        bio:         form.bio || undefined,
        avatar:      form.avatar || undefined,
        socialLinks: {
          twitter:   form.twitter   || undefined,
          linkedin:  form.linkedin  || undefined,
          website:   form.website   || undefined,
          instagram: form.instagram || undefined,
          facebook:  form.facebook  || undefined,
          youtube:   form.youtube   || undefined,
        },
      } as any);
      toast.success('User created');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] flex flex-col rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-brand-navy flex-shrink-0">
          <h3 className="text-sm font-bold text-white">Create User</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Full Name *</span>
              <input value={form.name} onChange={set('name')} className="admin-input w-full" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Email *</span>
              <input value={form.email} onChange={set('email')} type="email" className="admin-input w-full" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Password *</span>
            <div className="flex gap-2">
              <input
                value={form.password}
                onChange={set('password')}
                type={showPassword ? 'text' : 'password'}
                className="admin-input w-full"
                placeholder="Min 8 characters"
              />
              <button
                onClick={() => setShowPassword((p) => !p)}
                className="px-3 text-xs text-ink-muted border border-gray-200 hover:bg-gray-50 transition-colors font-sans"
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Role *</span>
              <select
                value={form.role}
                onChange={set('role')}
                className="admin-select w-full text-sm"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Designation</span>
              <input value={form.designation} onChange={set('designation')} placeholder="e.g. Senior Reporter" className="admin-input w-full" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Bio</span>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              rows={3}
              maxLength={500}
              placeholder="Short author biography (max 500 characters)"
              className="admin-input w-full resize-none"
            />
            <span className="text-[10px] text-ink-faint font-sans">{form.bio.length}/500</span>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Avatar URL</span>
            <input value={form.avatar} onChange={set('avatar')} placeholder="https://..." className="admin-input w-full font-mono text-xs" />
            {form.avatar && <img src={form.avatar} alt="Preview" className="mt-2 w-12 h-12 rounded-full object-cover border border-gray-200" />}
          </label>

          <div className="pt-2">
            <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-3 font-sans">Social Links</p>
            {(
              [
                { key: 'twitter' as const,   label: 'Twitter / X',      placeholder: 'https://twitter.com/handle'   },
                { key: 'instagram' as const, label: 'Instagram',          placeholder: 'https://instagram.com/handle' },
                { key: 'facebook' as const,  label: 'Facebook',            placeholder: 'https://facebook.com/page'    },
                { key: 'linkedin' as const,  label: 'LinkedIn',            placeholder: 'https://linkedin.com/in/...'  },
                { key: 'youtube' as const,   label: 'YouTube',             placeholder: 'https://youtube.com/@channel' },
                { key: 'website' as const,   label: 'Personal Website',    placeholder: 'https://...'                  },
              ]
            ).map(({ key, label, placeholder }) => (
              <label key={key} className="block mb-3">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">{label}</span>
                <input value={form[key]} onChange={set(key)} placeholder={placeholder} type="url" className="admin-input w-full font-mono text-xs" />
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 py-2.5 text-sm text-ink hover:bg-gray-50 transition-colors font-sans">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.email.trim() || !form.password} className="flex-1 bg-brand-navy text-brand-yellow py-2.5 text-sm font-bold hover:bg-brand-navy-dark disabled:opacity-40 transition-colors font-sans flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {submitting ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Profile Panel ──────────────────────────────────────────────────────
function EditProfilePanel({ user, currentUserRole, onClose, onSaved }: { user: AuthorProfile; currentUserRole: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name:        user.name        ?? '',
    role:        user.role        ?? 'contributor',
    designation: user.designation ?? '',
    bio:         user.bio         ?? '',
    avatar:      user.avatar      ?? '',
    twitter:     user.socialLinks?.twitter   ?? '',
    linkedin:    user.socialLinks?.linkedin  ?? '',
    website:     user.socialLinks?.website   ?? '',
    instagram:   user.socialLinks?.instagram ?? '',
    facebook:    user.socialLinks?.facebook  ?? '',
    youtube:     user.socialLinks?.youtube   ?? '',
  });
  const [saving, setSaving] = useState(false);

  const setVal = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update profile fields
      await api.patch(`/users/admin/${user._id}/profile`, {
        name:        form.name,
        designation: form.designation,
        bio:         form.bio,
        avatar:      form.avatar || undefined,
        socialLinks: {
          twitter:   form.twitter   || undefined,
          linkedin:  form.linkedin  || undefined,
          website:   form.website   || undefined,
          instagram: form.instagram || undefined,
          facebook:  form.facebook  || undefined,
          youtube:   form.youtube   || undefined,
        },
      });
      // Separately update role if changed and requester is superadmin
      if (currentUserRole === 'superadmin' && form.role !== user.role) {
        await api.patch(`/users/admin/${user._id}/role`, { role: form.role });
      }
      toast.success('Profile updated');
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-brand-navy">
          <div className="flex items-center gap-2.5">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center">
                <span className="text-brand-navy font-bold text-sm">{user.name[0]}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-[10px] text-white/50 font-sans capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-3 font-sans">Profile Information</p>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Full Name *</span>
              <input value={form.name} onChange={setVal('name')} className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy" />
            </label>

            {/* Role — superadmin only, can't demote themselves */}
            {currentUserRole === 'superadmin' && user.role !== 'superadmin' && (
              <label className="block mb-3">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Role</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as 'subscriber' | 'contributor' | 'editor' | 'admin' | 'superadmin' }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy bg-white"
                >
                  {['subscriber', 'contributor', 'editor', 'admin'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
            )}

            <label className="block mb-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Designation</span>
              <input value={form.designation} onChange={setVal('designation')} placeholder="e.g. Senior Correspondent, Guest Contributor" className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy" />
            </label>
            <label className="block mb-3">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Bio</span>
              <textarea value={form.bio} onChange={setVal('bio')} rows={3} maxLength={500} placeholder="Short author biography (max 500 characters)" className="w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-navy resize-none" />
              <span className="text-[10px] text-ink-faint font-sans">{form.bio.length}/500</span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">Avatar URL</span>
              <input value={form.avatar} onChange={setVal('avatar')} placeholder="https://..." className="w-full border border-gray-200 px-3 py-2 outline-none focus:border-brand-navy font-mono text-xs" />
              {form.avatar && <img src={form.avatar} alt="Preview" className="mt-2 w-12 h-12 rounded-full object-cover border border-gray-200" />}
            </label>
          </div>
          <div className="pt-2">
            <p className="text-[9px] font-black uppercase tracking-[3px] text-ink-muted mb-3 font-sans">Social Links</p>
            {(
              [
                { key: 'twitter' as const,   label: 'Twitter / X',      placeholder: 'https://twitter.com/handle'   },
                { key: 'instagram' as const, label: 'Instagram',          placeholder: 'https://instagram.com/handle' },
                { key: 'facebook' as const,  label: 'Facebook',            placeholder: 'https://facebook.com/page'    },
                { key: 'linkedin' as const,  label: 'LinkedIn',            placeholder: 'https://linkedin.com/in/...'  },
                { key: 'youtube' as const,   label: 'YouTube',             placeholder: 'https://youtube.com/@channel' },
                { key: 'website' as const,   label: 'Personal Website',    placeholder: 'https://...'                  },
              ]
            ).map(({ key, label, placeholder }) => (
              <label key={key} className="block mb-3">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wide block mb-1">{label}</span>
                <input value={form[key]} onChange={setVal(key)} placeholder={placeholder} type="url" className="w-full border border-gray-200 px-3 py-2 outline-none focus:border-brand-navy font-mono text-xs" />
              </label>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 flex gap-2">
          <button onClick={onClose} className="flex-1 border border-gray-200 py-2.5 text-sm text-ink hover:bg-gray-50 transition-colors font-sans">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 bg-brand-navy text-brand-yellow py-2.5 text-sm font-bold hover:bg-brand-navy-dark disabled:opacity-40 transition-colors font-sans flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAdminAuth();
  const [search,       setSearch]       = useState('');
  const [role,         setRole]         = useState('');
  const [page,         setPage]         = useState(1);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);
  const [editTarget,   setEditTarget]   = useState<AuthorProfile | null>(null);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, role, page }],
    queryFn:  () => usersAdmin.getAll({ search: search || undefined, role: role || undefined, page, limit: 20 }),
  });

  const users = data?.data?.data?.users || [];
  const meta  = data?.data?.meta;

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersAdmin.toggleActive(id),
    onSuccess: () => {
      toast.success('User status updated');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setToggleTarget(null);
    },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAdmin.delete(id),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const updateRole = async (userId: string, newRole: string) => {
    if (userId === currentUser?._id && newRole !== 'superadmin') {
      toast.error('Cannot change your own role');
      return;
    }
    try {
      await usersAdmin.updateRole(userId, newRole);
      toast.success('Role updated');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch {
      toast.error('Failed to update role');
    }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-sans text-ink-muted">{meta?.total || 0} total users</p></div>
        {['admin', 'superadmin'].includes(currentUser?.role ?? '') && (
          <button onClick={() => setCreateOpen(true)} className="admin-btn-primary gap-2 text-xs flex items-center">
            <Plus size={14} /> Create User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 flex-1 min-w-0 max-w-xs">
          <Search size={14} className="text-ink-muted flex-shrink-0" />
          <input
            type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="text-sm font-sans outline-none flex-1 bg-transparent text-ink placeholder:text-ink-muted"
          />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="admin-select w-auto min-w-[120px] text-sm">
          {ROLES.map((r) => (<option key={r} value={r}>{r || 'All Roles'}</option>))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">Designation</th>
                <th className="table-th">Articles</th>
                <th className="table-th">Status</th>
                <th className="table-th">Joined</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array(8).fill(0).map((_, j) => (
                      <td key={j} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center text-ink-muted py-8">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u._id} className={cn('table-row', !u.isActive && 'opacity-60')}>
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-navy text-brand-yellow flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <a
                            href={`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}/author/${u._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-ink hover:text-brand-navy transition-colors"
                            title="View public profile"
                          >
                            {u.name}
                          </a>
                          {(u.role !== 'subscriber' || u.name === 'The Orbis Journal Desk') && <VerifiedBadge className="w-3 h-3" />}
                        </div>
                        {u.designation && <p className="text-xs text-ink-muted">{u.designation}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-ink-muted text-xs">{u.email}</td>
                  <td className="table-td">
                    {currentUser?.role === 'superadmin' && u._id !== currentUser._id ? (
                      <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)} className="text-xs border border-gray-200 py-1 px-2 outline-none font-sans">
                        {ROLES.filter(Boolean).map((r) => (<option key={r} value={r}>{r}</option>))}
                      </select>
                    ) : (
                      <span className={cn('text-xs font-bold px-2 py-0.5 uppercase tracking-wide', ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500')}>{u.role}</span>
                    )}
                  </td>
                  <td className="table-td text-ink-muted text-xs">{u.designation || '—'}</td>
                  <td className="table-td text-ink-muted text-xs">{u.articlesCount ?? 0}</td>
                  <td className="table-td">
                    <span className={cn('text-xs font-bold px-2 py-0.5 uppercase tracking-wide', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="table-td text-ink-muted text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <a
                        href={`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}/author/${u._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-ink-muted hover:text-brand-navy transition-colors"
                        title="View public profile"
                      >
                        <ExternalLink size={14} />
                      </a>
                      {['contributor', 'editor', 'admin', 'superadmin'].includes(u.role) && (
                        <button onClick={() => setEditTarget(u as AuthorProfile)} className="p-1.5 text-ink-muted hover:text-brand-navy transition-colors" title="Edit author profile">
                          <Edit2 size={14} />
                        </button>
                      )}
                      {u._id !== currentUser?._id && (
                        <button onClick={() => setToggleTarget(u)} className={cn('p-1.5 transition-colors', u.isActive ? 'text-accent-red hover:text-red-700' : 'text-accent-green hover:text-green-700')} title={u.isActive ? 'Deactivate' : 'Activate'}>
                          {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        )}
                      {currentUser?.role === 'superadmin' && u._id !== currentUser._id && (
                        <button onClick={() => setDeleteTarget(u)} className="p-1.5 text-ink-muted hover:text-accent-red transition-colors" title="Delete user">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (meta.totalPages ?? 1) > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
            <p className="text-xs text-ink-muted font-sans">
              Page {meta.page} of {meta.totalPages} &nbsp;·&nbsp; {meta.total} users
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!meta.hasPrevPage} className="admin-btn-secondary py-1.5 text-xs">Previous</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={!meta.hasNextPage} className="admin-btn-secondary py-1.5 text-xs">Next</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!toggleTarget} title={toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${toggleTarget?.isActive ? 'deactivate' : 'activate'} ${toggleTarget?.name}?`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'} danger={toggleTarget?.isActive}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget._id)} onCancel={() => setToggleTarget(null)}
      />

      <ConfirmModal
        isOpen={!!deleteTarget} title="Delete User" confirmLabel="Delete" danger
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)} onCancel={() => setDeleteTarget(null)}
      />

      {createOpen && <CreateUserModal currentUserRole={currentUser?.role ?? 'admin'} onClose={() => setCreateOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['admin', 'users'] })} />}

      {editTarget && <EditProfilePanel user={editTarget} currentUserRole={currentUser?.role ?? 'admin'} onClose={() => setEditTarget(null)} onSaved={() => qc.invalidateQueries({ queryKey: ['admin', 'users'] })} />}
    </div>
  );
}