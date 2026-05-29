import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, Bookmark, LogOut, Clock, BookmarkX } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { formatDate } from '../utils/helpers';

// ── Saved Articles Tab ────────────────────────────────────────────────────────
function SavedArticlesTab({ user }: { user: any }) {
  const qc = useQueryClient();
  const { refreshUser } = useAuth();

  const removeMutation = useMutation({
    mutationFn: (articleId: string) => api.patch(`/users/me/saved/${articleId}`),
    onSuccess: () => { refreshUser?.(); },
    onError: () => toast.error('Failed to remove bookmark'),
  });

  const saved: any[] = user?.savedArticles ?? [];

  if (saved.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-gray-200">
        <Bookmark size={28} className="text-gray-300 mx-auto mb-3" />
        <p className="text-ink-muted font-sans text-sm">No saved articles yet.</p>
        <p className="text-ink-faint font-sans text-xs mt-1">
          Click the <strong>Save</strong> button on any article to bookmark it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {saved.map((art: any) => (
        <div key={art._id} className="flex items-start gap-4 py-4 group">
          {art.featuredImage?.url && (
            <img
              src={art.featuredImage.url}
              alt={art.title}
              className="w-16 h-16 object-cover flex-shrink-0 bg-gray-100"
            />
          )}
          <div className="flex-1 min-w-0">
            <Link
              to={`/article/${art.slug}`}
              className="text-[14px] font-serif font-semibold text-ink hover:text-brand-navy transition-colors line-clamp-2 block leading-snug"
            >
              {art.title}
            </Link>
            {art.publishedAt && (
              <p className="text-[11px] text-ink-muted font-sans mt-1 flex items-center gap-1">
                <Clock size={10} /> {formatDate(art.publishedAt)}
              </p>
            )}
          </div>
          <button
            onClick={() => removeMutation.mutate(art._id)}
            disabled={removeMutation.isPending && (removeMutation.variables === art._id)}
            title="Remove bookmark"
            className="flex-shrink-0 p-1.5 text-ink-faint hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40"
          >
            <BookmarkX size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'profile' | 'password' | 'saved'>('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', bio: '', designation: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  if (!user) {
    navigate('/login'); return null;
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      await authService.updateProfile(profileForm);
      await refreshUser?.();
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    setSaving(true);
    try {
      await authService.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    } finally { setSaving(false); }
  };

  const savedCount = (user as any)?.savedArticles?.length ?? 0;

  const TABS = [
    { key: 'profile', label: 'Profile', icon: <User size={15} /> },
    { key: 'password', label: 'Password', icon: <Lock size={15} /> },
    { key: 'saved',    label: `Saved${savedCount > 0 ? ` (${savedCount})` : ''}`, icon: <Bookmark size={15} /> },
  ] as const;

  return (
    <div className="container-site max-w-3xl py-12">
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            : <span className="text-brand-yellow text-2xl font-serif font-black">{user.name[0]}</span>
          }
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-ink">{user.name}</h1>
          <p className="text-ink-muted text-sm font-sans">{user.email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-brand-yellow text-brand-navy">
            {user.role}
          </span>
        </div>
        <button onClick={async () => { await logout(); navigate('/'); }}
          className="ml-auto flex items-center gap-2 text-sm text-ink-muted hover:text-accent-red transition-colors font-sans">
          <LogOut size={15} /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold font-sans border-b-2 transition-all -mb-px ${tab === t.key ? 'border-brand-navy text-brand-navy' : 'border-transparent text-ink-muted hover:text-ink'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="form-label">Bio</label>
            <textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="input-field resize-none" placeholder="A short bio about yourself…" />
          </div>
          <div>
            <label className="form-label">Designation</label>
            <input type="text" value={profileForm.designation} onChange={e => setProfileForm({...profileForm, designation: e.target.value})} className="input-field" placeholder="e.g. Journalist, Researcher…" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={handlePasswordSave} className="space-y-4 max-w-md">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map(field => (
            <div key={field}>
              <label className="form-label">{field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
              <input type="password" value={passwordForm[field]} onChange={e => setPasswordForm({...passwordForm, [field]: e.target.value})} className="input-field" required />
            </div>
          ))}
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
            {saving ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      )}

      {tab === 'saved' && (
        <SavedArticlesTab user={user} />
      )}
    </div>
  );
}
