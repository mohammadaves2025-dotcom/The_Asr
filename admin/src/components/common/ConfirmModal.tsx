import { TriangleAlert as AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white w-full max-w-sm mx-4 p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className={danger ? 'text-accent-red flex-shrink-0 mt-0.5' : 'text-accent-amber flex-shrink-0 mt-0.5'} />
          <div>
            <h3 className="text-base font-semibold font-sans text-ink">{title}</h3>
            <p className="text-sm text-ink-muted font-sans mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button onClick={onCancel} className="admin-btn-secondary">Cancel</button>
          <button
            onClick={onConfirm}
            className={danger ? 'admin-btn admin-btn-danger' : 'admin-btn admin-btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
