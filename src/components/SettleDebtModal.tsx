import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Scale, Check, Loader2 } from 'lucide-react';

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
  const settleMutation = useMutation(
    (api as any).groups?.settleGroupDebt || (api as any).groups?.addSettlement
  );

  const [fromMemberId, setFromMemberId] = useState<string>(
    initialFromMemberId ?? members[0]?._id ?? ''
  );
  const [toMemberId, setToMemberId] = useState<string>(
    initialToMemberId ?? members[1]?._id ?? ''
  );
  const [amount, setAmount] = useState<string>(
    initialAmount ? String(initialAmount) : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!fromMemberId || !toMemberId || fromMemberId === toMemberId || isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await settleMutation({
        groupId,
        fromMemberId: fromMemberId as Id<'groupMembers'>,
        toMemberId: toMemberId as Id<'groupMembers'>,
        amountALL: numAmount,
        currency: groupCurrency,
      });

      setAmount('');
      onClose();
    } catch (err) {
      console.error('Failed to record settlement:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Record Settlement</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Who Paid? *
            </label>
            <select
              value={fromMemberId}
              onChange={(e) => setFromMemberId(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Paid To *
            </label>
            <select
              value={toMemberId}
              onChange={(e) => setToMemberId(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500"
            >
              {members
                .filter((m) => m._id !== fromMemberId)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Amount ({groupCurrency}) *
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

          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
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