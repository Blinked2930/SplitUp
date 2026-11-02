import React from 'react';
import { createPortal } from 'react-dom';
import { TriangleAlert } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'destructive' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  tone = 'destructive',
}) => {
  if (!isOpen) return null;

  const confirmClass =
    tone === 'destructive'
      ? 'bg-rose-600 text-white hover:bg-rose-700'
      : 'bg-emerald-600 text-white hover:bg-emerald-700';

  const iconBg =
    tone === 'destructive'
      ? 'bg-rose-50 border-rose-200'
      : 'bg-emerald-50 border-emerald-200';
  const iconColor = tone === 'destructive' ? 'text-rose-500' : 'text-emerald-600';

  return createPortal(
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 ${iconBg}`}
          >
            <TriangleAlert className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`py-3 rounded-2xl text-xs font-bold cursor-pointer transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};