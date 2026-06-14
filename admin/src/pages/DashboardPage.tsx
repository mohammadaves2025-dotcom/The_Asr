import { useQuery } from '@tanstack/react-query';
import { FileText, Users, Eye, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { articlesAdmin, usersAdmin, submissionsAdmin, statsAdmin } from '../services/admin';
import { formatDate, formatRelative } from '../utils/helpers';
import { useAdminAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAdminAuth();
  const isContributor = user?.role === 'contributor';

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn:  () => statsAdmin.get(),
    staleTime: 60_000,
  });

  const { data: articlesData } = useQuery({
    queryKey: ['admin', 'articles', 'dashboard'],
    queryFn: () => articlesAdmin.getAll({ limit: 5, sort: '-updatedAt' }),
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users', 'dashboard'],
    queryFn: () => usersAdmin.getAll({ limit: 5 }),
    enabled: !isContributor,
  });

  const { data: submissionsData } = useQuery({
    queryKey: ['admin', 'submissions', 'dashboard'],
    queryFn: () => submissionsAdmin.getAll({ limit: 5, status: 'new' }),
  });

  const articles    = articlesData?.data?.data?.articles   || [];
  const users       = usersData?.data?.data?.users         || [];
  const submissions = submissionsData?.data?.data?.submissions || [];

  const stats = statsData?.data?.data;
  const totalArticles    = stats?.articles?.total    ?? articlesData?.data?.meta?.total    ?? 0;
  const totalUsers       = stats?.users?.total       ?? usersData?.data?.meta?.total       ?? 0;
  const newSubmissions   = stats?.submissions?.new   ?? submissionsData?.data?.meta?.total ?? 0;
  const totalViews       = stats?.views?.total       ?? 0;

  return (
    <div className="p-6 space-y-7 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles"   value={totalArticles}  icon={FileText} color="#122837" />
        {!isContributor && <StatCard label="Total Users"      value={totalUsers}     icon={Users}    color="#0e7490" />}
        <StatCard label="New Submissions"  value={newSubmissions} icon={Send}     color="#b45309" />
        <StatCard label="Total Views"      value={totalViews}     icon={Eye}      color="#16a34a" />
      </div>

      {/* Recent Articles */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="admin-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold font-sans text-ink">Recent Articles</h2>
            <Link to="/articles" className="text-xs font-sans text-brand-navy hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {articles.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-muted text-center font-sans">No articles yet</p>
            ) : articles.map((a: any) => (
              <div key={a._id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-surface-secondary transition-colors">
                {a.featuredImage?.url && (
                  <img src={a.featuredImage.url} alt="" className="w-12 h-9 object-cover flex-shrink-0 bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink line-clamp-1 font-sans">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={a.status} />
                    <span className="text-xs text-ink-muted">{formatRelative(a.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Submissions */}
        <div className="admin-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold font-sans text-ink">New Submissions</h2>
            <Link to="/submissions" className="text-xs font-sans text-brand-navy hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {submissions.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-muted text-center font-sans">No new submissions</p>
            ) : submissions.map((s: any) => (
              <div key={s._id} className="px-5 py-3.5 hover:bg-surface-secondary transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink line-clamp-1 font-sans">{s.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{s.type}</span>
                      <span className="text-xs text-ink-muted">by {s.name}</span>
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Users — hidden from contributors */}
      {!isContributor && <div className="admin-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold font-sans text-ink">Recent Registrations</h2>
          <Link to="/users" className="text-xs font-sans text-brand-navy hover:underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">User</th>
                <th className="table-th">Email</th>
                <th className="table-th">Role</th>
                <th className="table-th">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={4} className="table-td text-center text-ink-muted">No users yet</td></tr>
              ) : users.map((u: any) => (
                <tr key={u._id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-2.5">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-navy text-brand-yellow flex items-center justify-center text-xs font-bold">{u.name[0]}</div>
                      )}
                      <span className="font-medium text-ink">{u.name}</span>
                    </div>
                  </td>
                  <td className="table-td text-ink-muted">{u.email}</td>
                  <td className="table-td"><StatusBadge status={u.role} /></td>
                  <td className="table-td text-ink-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
}