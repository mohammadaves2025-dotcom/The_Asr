import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, UserCheck, UserX } from 'lucide-react';
import { usersAdmin } from '../services/admin';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatDate, cn, ROLE_COLORS } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../context/AuthContext';
import type { User } from '../types';

const ROLES = ['', 'subscriber', 'contributor', 'editor', 'admin', 'superadmin'];

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: currentUser } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [toggleTarget, setToggleTarget] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, role, page }],
    queryFn: () => usersAdmin.getAll({ search: search || undefined, role: role || undefined, page, limit: 20 }),
  });

  const users = data?.data?.data?.users || [];
  const meta = data?.data?.meta;

  const toggleMutation = useMutation({
    mutationFn: (id: string) => usersAdmin.toggleActive(id),
    onSuccess: () => {
      toast.success('User status updated');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setToggleTarget(null);
    },
    onError: () => toast.error('Failed to update user'),
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
      <div>
        <p className="text-xs font-sans text-ink-muted">{meta?.total || 0} total users</p>
      </div>

      {/* Filters */}
      <div className="admin-card p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border border-gray-200 bg-white px-3 py-2 flex-1 min-w-0 max-w-xs">
          <Search size={14} className="text-ink-muted flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="text-sm font-sans outline-none flex-1 bg-transparent text-ink placeholder:text-ink-muted"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="admin-select w-auto min-w-[120px] text-sm"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r || 'All Roles'}</option>
          ))}
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
                <th className="table-th">Status</th>
                <th className="table-th">Joined</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="table-td text-center text-ink-muted py-8">No users found</td></tr>
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
                        <p className="text-sm font-medium text-ink">{u.name}</p>
                        {u.designation && <p className="text-xs text-ink-muted">{u.designation}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-ink-muted text-xs">{u.email}</td>
                  <td className="table-td">
                    {currentUser?.role === 'superadmin' && u._id !== currentUser._id ? (
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        className="text-xs border border-gray-200 py-1 px-2 outline-none font-sans"
                      >
                        {ROLES.filter(Boolean).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={cn('text-xs font-bold px-2 py-0.5 uppercase tracking-wide', ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-500')}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="table-td">
                    <span className={cn('text-xs font-bold px-2 py-0.5 uppercase tracking-wide', u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-td text-ink-muted text-xs whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="table-td">
                    {u._id !== currentUser?._id && (
                      <button
                        onClick={() => setToggleTarget(u)}
                        className={cn('p-1.5 transition-colors', u.isActive ? 'text-accent-red hover:text-red-700' : 'text-accent-green hover:text-green-700')}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-200">
            <p className="text-xs text-ink-muted font-sans">Page {meta.page} of {meta.totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!meta.hasPrevPage} className="admin-btn-secondary py-1.5 text-xs">Previous</button>
              <button onClick={() => setPage(p => p + 1)} disabled={!meta.hasNextPage} className="admin-btn-secondary py-1.5 text-xs">Next</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!toggleTarget}
        title={toggleTarget?.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${toggleTarget?.isActive ? 'deactivate' : 'activate'} ${toggleTarget?.name}?`}
        confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
        danger={toggleTarget?.isActive}
        onConfirm={() => toggleTarget && toggleMutation.mutate(toggleTarget._id)}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}
