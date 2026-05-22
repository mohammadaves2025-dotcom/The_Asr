import { Menu, Bell } from 'lucide-react';
import { useAdminAuth } from '../../context/AuthContext';

interface Props {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: Props) {
  const { user } = useAdminAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 text-ink-muted hover:text-ink transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold font-sans text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-1.5 text-ink-muted hover:text-ink transition-colors">
          <Bell size={17} />
        </button>
        {user && (
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-navy text-brand-yellow flex items-center justify-center text-xs font-bold">
                {user.name[0]}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-ink leading-none">{user.name}</p>
              <p className="text-[10px] text-ink-muted uppercase tracking-wide mt-0.5">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
