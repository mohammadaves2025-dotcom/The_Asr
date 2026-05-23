import { useAdminAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

export default function SettingsPage() {
  const { user } = useAdminAuth();

  return (
    <div className="p-6 max-w-2xl space-y-6 animate-fade-in">
      <div className="admin-card p-6">
        <h2 className="text-sm font-semibold font-sans text-ink mb-5">My Account</h2>
        <div className="flex items-start gap-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-brand-navy text-brand-yellow flex items-center justify-center text-xl font-bold flex-shrink-0">
              {user?.name[0]}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-ink">{user?.name}</p>
            <p className="text-sm text-ink-muted">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold bg-brand-navy text-brand-yellow px-2 py-0.5 uppercase tracking-wide">{user?.role}</span>
              {user?.isVerified && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 uppercase tracking-wide">Verified</span>}
            </div>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-gray-200 grid grid-cols-2 gap-4 text-sm font-sans">
          <div>
            <p className="text-xs text-ink-muted mb-1 uppercase tracking-wide font-semibold">Account Created</p>
            <p className="text-ink">{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-1 uppercase tracking-wide font-semibold">Last Login</p>
            <p className="text-ink">{user?.lastLogin ? formatDate(user.lastLogin) : '—'}</p>
          </div>
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="text-sm font-semibold font-sans text-ink mb-4">System Info</h2>
        <div className="space-y-3 text-sm font-sans">
          <div className="flex justify-between">
            <span className="text-ink-muted">API URL</span>
            <span className="text-ink font-medium">{import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Client URL</span>
            <span className="text-ink font-medium">{import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Environment</span>
            <span className="text-ink font-medium">{import.meta.env.MODE}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
