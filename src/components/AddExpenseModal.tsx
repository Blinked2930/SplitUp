import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Receipt, Check } from 'lucide-react';

interface Member {
  _id: Id<'groupMembers'>;
  name: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: Id<'groups'>;
  groupCurrency: 'ALL' | 'EUR' | 'USD';
  members: Member[];
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupCurrency,
  members,
}) => {
  const addExpenseMutation = useMutation(
    (api as any).groups?.addExpense || (api as any).groups?.addGroupExpense
  );

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidByMemberId, setPaidByMemberId] = useState<string>(members[0]?._id ?? '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((m) => m._id));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const splitAmount = Math.round((numAmount / selectedMemberIds.length) * 100) / 100;
      const splits = selectedMemberIds.map((mId) => ({
        memberId: mId as Id<'groupMembers'>,
        amountALL: splitAmount,
      }));

      await addExpenseMutation({
        groupId,
        title: title.trim(),
        amount: numAmount,
        currency: groupCurrency,
        amountInALL: numAmount,
        paidByMemberId: paidByMemberId as Id<'groupMembers'>,
        splitType: 'equal',
        splits,
      });

      setTitle('');
      setAmount('');
      onClose();
    } catch (err) {
      console.error('Failed to add expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Add Group Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Expense Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner in Tirana, Furgon ride"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Paid By *
              </label>
              <select
                value={paidByMemberId}
                onChange={(e) => setPaidByMemberId(e.target.value)}
                className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold focus:outline-none focus:border-emerald-500"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Split Equally Between
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => {
                const isSelected = selectedMemberIds.includes(m._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => toggleMember(m._id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{m.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !amount}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Expense'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};