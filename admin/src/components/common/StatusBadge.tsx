import { cn, STATUS_COLORS } from '../../utils/helpers';

interface Props {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className }: Props) {
  return (
    <span className={cn('status-badge rounded-full', STATUS_COLORS[status] || 'bg-gray-100 text-gray-500', className)}>
      {status.replace('-', ' ')}
    </span>
  );
}
