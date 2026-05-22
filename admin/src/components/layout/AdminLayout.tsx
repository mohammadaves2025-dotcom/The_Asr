import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/articles': 'Articles',
  '/categories': 'Categories',
  '/comments': 'Comments',
  '/submissions': 'Submissions',
  '/newsletter': 'Newsletter',
  '/users': 'Users',
  '/settings': 'Settings',
};

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const title = Object.entries(PAGE_TITLES).find(([path]) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  })?.[1] || 'Admin';

  return (
    <div className="flex h-screen overflow-hidden bg-surface-secondary">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar title={title} onMenuClick={() => setCollapsed(!collapsed)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
