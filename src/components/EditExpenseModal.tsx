// src/components/EditExpenseModal.tsx
import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Receipt, Check, Trash2, ChevronDown } from 'lucide-react';

interface Member {
  _id: Id<'groupMembers'>;
  name: string;
}

interface Expense {
  _id: Id<'groupExpenses'>;
  title: string;
  amount: number;
  currency: 'ALL' | 'EUR' | 'USD';
  category?: string;
  paidByMemberId: Id<'groupMembers'>;
  splitType: 'equal' | 'exact' | 'shares';
  splits: Array<{ memberId: Id<'groupMembers'>; amountALL: number }>;
}

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  groupCurrency: 'ALL' | 'EUR' | 'USD';
  members: Member[];
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  groupCurrency,
  members,
}) => {
  const updateExpenseMutation = useMutation((api as any).groups?.updateExpense);
  const deleteExpenseMutation = useMutation((api as any).groups?.deleteExpense);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('General');
  const [paidByMemberId, setPaidByMemberId] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'equal' | 'exact' | 'shares'>('equal');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ['Food & Dining', 'Transportation', 'Accommodation', 'Utilities', 'Entertainment', 'General'];

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(expense.category || 'General');
      setPaidByMemberId(expense.paidByMemberId);
      setSplitMode(expense.splitType || 'equal');
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const numAmount = parseFloat(amount) || 0;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || numAmount <= 0) {
      setErrorMsg('Please enter a valid title and amount.');
      return;
    }

    const equalSplitVal = Math.round((numAmount / members.length) * 100) / 100;
    const splits = members.map((m) => ({
      memberId: m._id,
      amountALL: equalSplitVal,
    }));

    setIsSubmitting(true);
    try {
      await updateExpenseMutation({
        expenseId: expense._id,
        title: title.trim(),
        amount: numAmount,
        currency: groupCurrency,
        amountInALL: numAmount,
        category: category.trim(),
        paidByMemberId: paidByMemberId as Id<'groupMembers'>,
        splitType: splitMode,
        splits,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update expense:', err);
      setErrorMsg('Could not save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this expense?')) return;
    setIsSubmitting(true);
    try {
      await deleteExpenseMutation({ expenseId: expense._id });
      onClose();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paidByName = members.find((m) => m._id === paidByMemberId)?.name || 'Select member';

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
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Edit Expense</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Amount ({groupCurrency})
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{category}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Paid By
            </label>
            <button
              type="button"
              onClick={() => setShowPaidByDropdown(!showPaidByDropdown)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-semibold flex items-center justify-between cursor-pointer"
            >
              <span>{paidByName}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {showPaidByDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 overflow-hidden py-1">
                {members.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => {
                      setPaidByMemberId(m._id);
                      setShowPaidByDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleDelete}
              className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 font-bold hover:bg-rose-100 cursor-pointer transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};