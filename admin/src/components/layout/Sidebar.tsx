import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, MessageSquare, Tags, Mail, Send, Settings, LogOut, ChevronRight, ExternalLink
} from 'lucide-react';
import { useAdminAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';

const NAV_ITEMS = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/', roles: ['contributor', 'editor', 'admin', 'superadmin'] },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: FileText, label: 'Articles', href: '/articles', roles: ['contributor', 'editor', 'admin', 'superadmin'] },
      { icon: Tags, label: 'Categories', href: '/categories', roles: ['editor', 'admin', 'superadmin'] },
      { icon: MessageSquare, label: 'Comments', href: '/comments', roles: ['editor', 'admin', 'superadmin'] },
    ],
  },
  {
    label: 'Community',
    items: [
      { icon: Send, label: 'Submissions', href: '/submissions', roles: ['editor', 'admin', 'superadmin'] },
      { icon: Mail, label: 'Newsletter', href: '/newsletter', roles: ['editor', 'admin', 'superadmin'] },
    ],
  },
  {
    label: 'Users',
    items: [
      { icon: Users, label: 'Users', href: '/users', roles: ['admin', 'superadmin'] },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin', 'superadmin'] },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onCollapse?: () => void;
}

export default function Sidebar({ collapsed }: Props) {
  const location = useLocation();
  const { user, logout } = useAdminAuth();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-sidebar-bg border-r border-sidebar-border shadow-sidebar sticky top-0 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-14 border-b border-sidebar-border px-4 flex-shrink-0', collapsed && 'justify-center')}>
        {collapsed ? (
          <span className="text-xl font-serif font-bold text-brand-yellow">M</span>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Link to="/" className="flex items-center gap-1 no-underline">
              <span className="text-lg font-serif font-bold text-white">The Orbis Journal</span>
              <span className="text-lg font-serif font-bold text-brand-yellow">.</span>
            </Link>
            <span className="text-[9px] font-bold font-sans uppercase tracking-widest text-white/30 ml-1">CMS</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map((group) => {
          const items = group.items.filter((item) => !item.roles || item.roles.includes(user?.role ?? ''));
          if (items.length === 0) return null;
          return (
            <div key={group.label}>
              {!collapsed && (
                <p className="sidebar-section-label">{group.label}</p>
              )}
              {items.map(({ icon: Icon, label, href }) => (
                <Link
                  key={href}
                  to={href}
                  title={collapsed ? label : undefined}
                  className={cn(
                    'sidebar-link',
                    isActive(href) && 'sidebar-link-active',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Icon size={16} className={cn('flex-shrink-0', isActive(href) ? 'text-brand-yellow' : 'text-white/50')} />
                  {!collapsed && <span>{label}</span>}
                  {!collapsed && isActive(href) && (
                    <ChevronRight size={13} className="ml-auto text-brand-yellow" />
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border flex-shrink-0">
        {/* View site */}
        <a
          href={import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className={cn('sidebar-link text-white/40 hover:text-white/70', collapsed && 'justify-center')}
        >
          <ExternalLink size={14} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs">View Site</span>}
        </a>

        {/* User info */}
        {!collapsed && user && (
          <div className="px-4 py-3 flex items-center gap-2.5">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-yellow text-brand-navy flex items-center justify-center text-xs font-bold flex-shrink-0">
                {user.name[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className={cn('sidebar-link w-full text-white/40 hover:text-white/70 mb-2', collapsed && 'justify-center')}
        >
          <LogOut size={14} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
