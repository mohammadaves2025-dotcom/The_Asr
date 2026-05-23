import { type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: string;
}

export default function StatCard({ label, value, icon: Icon, change, changeType = 'neutral', color = '#122837' }: Props) {
  return (
    <div className="admin-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold font-sans uppercase tracking-wider text-ink-muted">{label}</p>
          <p className="text-3xl font-sans font-bold text-ink mt-1.5 leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={cn('text-xs font-sans mt-2', {
              'text-accent-green': changeType === 'up',
              'text-accent-red': changeType === 'down',
              'text-ink-muted': changeType === 'neutral',
            })}>
              {change}
            </p>
          )}
        </div>
        <div className="p-2.5 rounded" style={{ backgroundColor: color + '15' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
