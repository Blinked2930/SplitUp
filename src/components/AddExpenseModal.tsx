import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Receipt, Check, Calculator, PieChart, Users, AlertCircle, ChevronDown, RefreshCw } from 'lucide-react';
import { fetchExchangeRate } from '../utils/currencies';

interface Member {
  _id: Id<'groupMembers'>;
  name: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: Id<'groups'>;
  groupCurrency: string;
  allowedCurrencies?: string[];
  members: Member[];
}

type SplitMode = 'equal' | 'exact' | 'shares';

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupCurrency,
  allowedCurrencies = ['ALL', 'EUR', 'USD'],
  members,
}) => {
  const addExpenseMutation = useMutation(
    (api as any).groups?.addExpense || (api as any).groups?.addGroupExpense
  );

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(groupCurrency);
  const [customFxRate, setCustomFxRate] = useState<string>('1');
  const [category, setCategory] = useState('General');
  const [paidByMemberId, setPaidByMemberId] = useState<string>(members[0]?._id ?? '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((m) => m._id));
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');

  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [sharesMap, setSharesMap] = useState<Record<string, number>>({});
  const [showCategoryPopover, setShowCategoryPopover] = useState(false);
  const [showPaidByPopover, setShowPaidByPopover] = useState(false);
  const [showCurrencyPopover, setShowCurrencyPopover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = ['Food & Dining', 'Transportation', 'Accommodation', 'Utilities', 'Entertainment', 'General'];

  useEffect(() => {
    if (isOpen) {
      setSelectedCurrency(groupCurrency);
    }
  }, [isOpen, groupCurrency]);

  useEffect(() => {
    if (members.length > 0) {
      if (!paidByMemberId) setPaidByMemberId(members[0]._id);
      setSelectedMemberIds(members.map((m) => m._id));

      const initialShares: Record<string, number> = {};
      const initialExacts: Record<string, string> = {};
      members.forEach((m) => {
        initialShares[m._id] = 1;
        initialExacts[m._id] = '';
      });
      setSharesMap(initialShares);
      setExactAmounts(initialExacts);
    }
  }, [members]);

  useEffect(() => {
    if (selectedCurrency === groupCurrency) {
      setCustomFxRate('1');
    } else {
      fetchExchangeRate(selectedCurrency, groupCurrency).then((rate: number) => {
        setCustomFxRate(rate.toString());
      });
    }
  }, [selectedCurrency, groupCurrency]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const numRate = parseFloat(customFxRate) || 1;
  const baseConvertedAmount = Math.round(numAmount * numRate * 100) / 100;

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const totalExactAllocated = selectedMemberIds.reduce((sum, id) => {
    return sum + (parseFloat(exactAmounts[id] || '0') || 0);
  }, 0);

  const exactDifference = Math.round((baseConvertedAmount - totalExactAllocated) * 100) / 100;

  const totalShares = selectedMemberIds.reduce((sum, id) => {
    return sum + (sharesMap[id] || 1);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || numAmount <= 0) {
      setErrorMsg('Please enter a description and amount greater than 0.');
      return;
    }

    let splits: { memberId: Id<'groupMembers'>; amountALL: number }[] = [];

    if (splitMode === 'equal') {
      const splitVal = Math.round((baseConvertedAmount / selectedMemberIds.length) * 100) / 100;
      splits = selectedMemberIds.map((mId) => ({
        memberId: mId as Id<'groupMembers'>,
        amountALL: splitVal,
      }));
    } else if (splitMode === 'exact') {
      if (Math.abs(exactDifference) > 0.05) {
        setErrorMsg(
          `Exact splits must sum to ${baseConvertedAmount} ${groupCurrency}. Remaining: ${exactDifference} ${groupCurrency}`
        );
        return;
      }
      splits = selectedMemberIds.map((mId) => ({
        memberId: mId as Id<'groupMembers'>,
        amountALL: Math.round((parseFloat(exactAmounts[mId] || '0') || 0) * 100) / 100,
      }));
    } else if (splitMode === 'shares') {
      if (totalShares <= 0) {
        setErrorMsg('Total shares must be at least 1.');
        return;
      }
      splits = selectedMemberIds.map((mId) => {
        const memberShares = sharesMap[mId] || 1;
        const calculatedAmount = Math.round(((baseConvertedAmount * memberShares) / totalShares) * 100) / 100;
        return {
          memberId: mId as Id<'groupMembers'>,
          amountALL: calculatedAmount,
        };
      });
    }

    setIsSubmitting(true);
    try {
      await addExpenseMutation({
        groupId,
        title: title.trim(),
        amount: numAmount,
        currency: selectedCurrency,
        amountInALL: baseConvertedAmount,
        category: category.trim() || 'General',
        paidByMemberId: paidByMemberId as Id<'groupMembers'>,
        splitType: splitMode,
        splits,
      });

      setTitle('');
      setAmount('');
      setErrorMsg(null);
      onClose();
    } catch (err) {
      console.error('Failed to add expense:', err);
      setErrorMsg('Failed to save expense. Please try again.');
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
            <h3 className="text-lg font-bold text-slate-900">Add Group Expense</h3>
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
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner, Taxi, Groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Amount *
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
                Currency
              </label>
              <button
                type="button"
                onClick={() => setShowCurrencyPopover(true)}
                className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
              >
                <span>{selectedCurrency}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          {selectedCurrency !== groupCurrency && (
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  Convert to {groupCurrency}
                </span>
                <span className="font-mono">{baseConvertedAmount} {groupCurrency}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-700 text-[10px]">1 {selectedCurrency} =</span>
                <input
                  type="number"
                  step="any"
                  value={customFxRate}
                  onChange={(e) => setCustomFxRate(e.target.value)}
                  className="w-24 px-2 py-1 rounded-xl bg-white border border-amber-300 font-mono text-xs text-amber-900 focus:outline-none focus:border-amber-500"
                />
                <span className="text-amber-700 text-[10px]">{groupCurrency}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryPopover(true)}
                className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
              >
                <span className="truncate">{category}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Paid By *
              </label>
              <button
                type="button"
                onClick={() => setShowPaidByPopover(true)}
                className="w-full px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
              >
                <span className="truncate">{paidByName}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Split Option
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  splitMode === 'equal'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Equal
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('exact')}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  splitMode === 'exact'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                Exact
              </button>

              <button
                type="button"
                onClick={() => setSplitMode('shares')}
                className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  splitMode === 'shares'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                Shares
              </button>
            </div>
          </div>

          {splitMode === 'equal' && (
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => {
                const isSelected = selectedMemberIds.includes(m._id);
                return (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => toggleMember(m._id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
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
          )}

          {splitMode === 'exact' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1 font-medium">
                <span className="text-slate-500">Allocated: {totalExactAllocated} {groupCurrency}</span>
                <span className={Math.abs(exactDifference) <= 0.05 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {exactDifference === 0 ? 'Balanced' : `${exactDifference} ${groupCurrency} remaining`}
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {members.map((m) => (
                  <div key={m._id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-700 w-1/3 truncate">{m.name}</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={exactAmounts[m._id] || ''}
                      onChange={(e) =>
                        setExactAmounts({
                          ...exactAmounts,
                          [m._id]: e.target.value,
                        })
                      }
                      className="w-2/3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {splitMode === 'shares' && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-400 font-medium">
                Set relative shares per person (e.g. 2 shares = double portion).
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {members.map((m) => {
                  const currentShare = sharesMap[m._id] ?? 1;
                  const calculatedPortion =
                    totalShares > 0 && baseConvertedAmount > 0
                      ? Math.round(((baseConvertedAmount * currentShare) / totalShares) * 100) / 100
                      : 0;

                  return (
                    <div key={m._id} className="flex items-center justify-between gap-2 text-xs">
                      <div className="w-1/3 truncate">
                        <span className="font-semibold text-slate-700 block">{m.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {calculatedPortion} {groupCurrency}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSharesMap({
                              ...sharesMap,
                              [m._id]: Math.max(0, currentShare - 1),
                            })
                          }
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-bold w-4 text-center">{currentShare}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSharesMap({
                              ...sharesMap,
                              [m._id]: currentShare + 1,
                            })
                          }
                          className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || numAmount <= 0}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Expense'}</span>
          </button>
        </form>

        {showCurrencyPopover && (
          <div
            onClick={() => setShowCurrencyPopover(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-2 font-sans"
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Allowed Currencies
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {allowedCurrencies.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(c);
                      setShowCurrencyPopover(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      selectedCurrency === c
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{c}</span>
                    {selectedCurrency === c && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showCategoryPopover && (
          <div
            onClick={() => setShowCategoryPopover(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-2 font-sans"
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Select Category
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setShowCategoryPopover(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      category === cat
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showPaidByPopover && (
          <div
            onClick={() => setShowPaidByPopover(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-2 font-sans"
            >
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Select Member
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {members.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => {
                      setPaidByMemberId(m._id);
                      setShowPaidByPopover(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                      paidByMemberId === m._id
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{m.name}</span>
                    {paidByMemberId === m._id && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};