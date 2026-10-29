// src/components/SettleDebtModal.tsx
import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Scale, Check, ChevronDown, Loader2 } from 'lucide-react';

interface Member {
  _id: Id<'groupMembers'>;
  name: string;
}

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: Id<'groups'>;
  groupCurrency: 'ALL' | 'EUR' | 'USD';
  members: Member[];
  initialFromMemberId?: string;
  initialToMemberId?: string;
  initialAmount?: number;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupCurrency,
  members,
  initialFromMemberId,
  initialToMemberId,
  initialAmount,
}) => {
  const settleDebtMutation = useMutation((api as any).groups?.settleGroupDebt);

  const [fromMemberId, setFromMemberId] = useState<string>(members[0]?._id ?? '');
  const [toMemberId, setToMemberId] = useState<string>(members[1]?._id ?? members[0]?._id ?? '');
  const [amount, setAmount] = useState<string>('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialFromMemberId) setFromMemberId(initialFromMemberId);
      if (initialToMemberId) setToMemberId(initialToMemberId);
      if (initialAmount) setAmount(initialAmount.toString());
    }
  }, [isOpen, initialFromMemberId, initialToMemberId, initialAmount]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fromMemberId || !toMemberId || fromMemberId === toMemberId) {
      setError('Please select two different members.');
      return;
    }

    if (numAmount <= 0) {
      setError('Please enter an amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await settleDebtMutation({
        groupId,
        fromMemberId: fromMemberId as Id<'groupMembers'>,
        toMemberId: toMemberId as Id<'groupMembers'>,
        amountALL: numAmount,
        currency: groupCurrency,
      });

      onClose();
    } catch (err) {
      console.error('Failed to record settlement:', err);
      setError('Could not record settlement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromName = members.find((m) => m._id === fromMemberId)?.name || 'Payer';
  const toName = members.find((m) => m._id === toMemberId)?.name || 'Recipient';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 font-sans max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Settle Group Debt</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Payer (Who Paid) *
            </label>
            <button
              type="button"
              onClick={() => setShowFromDropdown(!showFromDropdown)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold flex items-center justify-between cursor-pointer"
            >
              <span>{fromName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                {members.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => {
                      setFromMemberId(m._id);
                      setShowFromDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Recipient (Who Received) *
            </label>
            <button
              type="button"
              onClick={() => setShowToDropdown(!showToDropdown)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold flex items-center justify-between cursor-pointer"
            >
              <span>{toName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                {members.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => {
                      setToMemberId(m._id);
                      setShowToDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Settlement Amount ({groupCurrency}) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || numAmount <= 0}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Recording...' : 'Record Payment'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};