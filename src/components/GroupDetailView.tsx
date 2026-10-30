import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
  ArrowLeft,
  Plus,
  Receipt,
  UserPlus,
  Scale,
  ArrowRight,
  Share2,
  Check,
  PieChart,
  Wallet,
  ChevronDown,
  ChevronUp,
  Settings2,
  Users,
} from 'lucide-react';
import { AddExpenseModal } from './AddExpenseModal';
import { AddMemberModal } from './AddMemberModal';
import { SettleDebtModal } from './SettleDebtModal';
import { GroupSettingsModal } from './GroupSettingsModal';
import { calculateBalances, simplifyDebts } from '../utils/debtCalculator';
import { fetchExchangeRate, formatCurrency, EXCHANGE_RATES } from '../utils/currencies';

interface GroupDetailViewProps {
  groupId: Id<'groups'>;
  onBack: () => void;
}

type GroupTab = 'transactions' | 'balances';

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, onBack }) => {
  const details = useQuery((api as any).groups?.getGroupDetails, { groupId });

  const [activeTab, setActiveTab] = useState<GroupTab>('transactions');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const [settleFrom, setSettleFrom] = useState<string | undefined>();
  const [settleTo, setSettleTo] = useState<string | undefined>();
  const [settleAmount, setSettleAmount] = useState<number | undefined>();

  const groupCurrency: string = details?.group?.currency ?? 'ALL';

  // Live FX rate: 1 ALL = ? groupCurrency
  const [rate, setRate] = useState<number>(() => {
    const fallback = EXCHANGE_RATES[groupCurrency];
    return fallback ? 1 / fallback : 1;
  });

  useEffect(() => {
    let cancelled = false;
    fetchExchangeRate('ALL', groupCurrency)
      .then((r) => {
        if (!cancelled) setRate(r);
      })
      .catch(() => {
        // fetchExchangeRate already falls back internally; nothing to do
      });
    return () => {
      cancelled = true;
    };
  }, [groupCurrency]);

  // Convert an amount stored in ALL into the group's display currency.
  const convertALL = (amountALL: number): number => {
    const converted = amountALL * rate;
    return Math.round(converted * 100) / 100;
  };

  // Format an ALL amount in the group's currency, e.g. "5,000 L" or "€50.00"
  const fmtGroup = (amountALL: number, showSign = false): string =>
    formatCurrency(convertALL(amountALL), groupCurrency, showSign);

  // 1. Calculate net balances and simplified debts
  const balances = useMemo(() => {
    if (!details) return new Map<string, number>();
    return calculateBalances(details.members, details.expenses, details.settlements || []);
  }, [details]);

  const simplifiedDebts = useMemo(() => {
    if (!details) return [];
    return simplifyDebts(details.members, balances);
  }, [details, balances]);

  // 2. Member Out-of-Pocket Spending Stats
  const memberSpending = useMemo(() => {
    if (!details) return new Map<string, number>();
    const map = new Map<string, number>();
    details.members.forEach((m: { _id: string }) => map.set(m._id, 0));

    details.expenses.forEach((exp: { paidByMemberId: string; amountInALL: number }) => {
      const current = map.get(exp.paidByMemberId) ?? 0;
      map.set(exp.paidByMemberId, current + exp.amountInALL);
    });

    return map;
  }, [details]);

  // 3. Category Breakdown Stats
  const categoryTotals = useMemo(() => {
    if (!details) return [];
    const totals: Record<string, number> = {};
    let totalSpent = 0;

    details.expenses.forEach((exp: { category?: string; amountInALL: number }) => {
      const cat = exp.category?.trim() || 'General';
      totals[cat] = (totals[cat] || 0) + exp.amountInALL;
      totalSpent += exp.amountInALL;
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [details]);

  const totalGroupSpentALL = useMemo(() => {
    if (!details) return 0;
    return details.expenses.reduce((sum: number, exp: { amountInALL: number }) => sum + exp.amountInALL, 0);
  }, [details]);

  if (!details) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-medium text-sm">
        Loading group...
      </div>
    );
  }

  const { group, members, expenses } = details;

  const allowedCurrencies: string[] =
    (group as any).allowedCurrencies ?? ['ALL', 'EUR', 'USD'];

  const handleCopyGroupId = () => {
    navigator.clipboard.writeText(group._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickSettle = (fromId: string, toId: string, amountALL: number) => {
    setSettleFrom(fromId);
    setSettleTo(toId);
    setSettleAmount(amountALL);
    setShowSettle(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
      {/* Sticky Header */}
      <header
        className="w-full sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-md mx-auto pb-3 px-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Back to groups"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 text-base truncate">{group.name}</h2>
            <p className="text-[10px] text-slate-400 font-medium">
              {members.length} Members · {group.currency}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Group settings"
              title="Group settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleCopyGroupId}
              className="p-2 -mr-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Copy invite ID"
              title="Copy Invite ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Actions Grid */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="py-3 px-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSettleFrom(undefined);
              setSettleTo(undefined);
              setSettleAmount(undefined);
              setShowSettle(true);
            }}
            className="py-3 px-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Settle</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddMember(true)}
            className="py-3 px-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Person</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-1 rounded-2xl bg-slate-200/80 grid grid-cols-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-600" />
            <span>Transactions ({expenses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('balances')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'balances'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Balances</span>
          </button>
        </div>

        {/* ============ TRANSACTIONS TAB ============ */}
        {activeTab === 'transactions' && (
          <>
            {/* Total Group Volume (moved here per request) */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Total Group Volume
                    </p>
                    <p className="text-base font-black text-slate-900 font-mono truncate">
                      {fmtGroup(totalGroupSpentALL)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer transition-colors shrink-0"
                >
                  <PieChart className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Breakdown</span>
                  {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showBreakdown && (
                <div className="pt-3 border-t border-slate-100 space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Categories
                    </p>
                    {categoryTotals.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No categorized expenses yet.</p>
                    ) : (
                      categoryTotals.map((cat) => (
                        <div key={cat.category} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold gap-2">
                            <span className="text-slate-700 truncate">{cat.category}</span>
                            <span className="font-mono text-slate-900 shrink-0">
                              {fmtGroup(cat.amount)} ({cat.percentage}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Paid Out Of Pocket
                    </p>
                    {members.map((m: { _id: string; name: string }) => {
                      const paidOut = memberSpending.get(m._id) ?? 0;
                      return (
                        <div key={m._id} className="flex items-center justify-between text-xs py-0.5 gap-2">
                          <span className="font-semibold text-slate-700 truncate">{m.name}</span>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            {fmtGroup(paidOut)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Expenses Feed */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Expenses ({expenses.length})
              </h3>

              {expenses.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                  <Receipt className="w-6 h-6 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">No expenses recorded for this group yet.</p>
                </div>
              ) : (
                expenses.map(
                  (exp: {
                    _id: string;
                    title: string;
                    amount: number;
                    currency: string;
                    amountInALL: number;
                    timestamp: number;
                    category?: string;
                  }) => {
                    const isSameCurrency = exp.currency === group.currency;
                    return (
                      <div
                        key={exp._id}
                        className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{exp.title}</h4>
                            {exp.category && (
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                                {exp.category}
                              </span>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-slate-900 text-sm">
                              {isSameCurrency
                                ? formatCurrency(exp.amount, exp.currency)
                                : formatCurrency(exp.amount, exp.currency)}
                            </div>
                            {!isSameCurrency && (
                              <div className="font-mono text-[10px] text-slate-400">
                                ≈ {fmtGroup(exp.amountInALL)}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          {new Date(exp.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    );
                  }
                )
              )}
            </div>
          </>
        )}

        {/* ============ BALANCES TAB ============ */}
        {activeTab === 'balances' && (
          <>
            {/* Suggested Settlements (moved here per request) */}
            {simplifiedDebts.length > 0 && (
              <div className="p-4 rounded-3xl bg-emerald-50/60 border border-emerald-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Suggested Settlements
                </h3>
                <div className="space-y-2">
                  {simplifiedDebts.map((debt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white p-3 rounded-2xl border border-emerald-200/60 shadow-sm text-xs font-medium gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-slate-900 truncate">{debt.fromName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-900 truncate">{debt.toName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-emerald-700">
                          {fmtGroup(debt.amountALL)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickSettle(debt.fromMemberId, debt.toMemberId, debt.amountALL)}
                          className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Member Net Balances */}
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Member Net Positions
                </h3>
                <span className="text-xs text-slate-500 font-medium">{group.currency}</span>
              </div>
              <div className="space-y-2">
                {members.map((m: { _id: string; name: string }) => {
                  const netALL = balances.get(m._id) ?? 0;
                  const net = Math.round(convertALL(netALL) * 100) / 100;
                  return (
                    <div key={m._id} className="flex items-center justify-between text-sm py-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 truncate">{m.name}</span>
                      </div>
                      <span
                        className={`font-mono font-bold text-xs shrink-0 ${
                          net > 0 ? 'text-emerald-600' : net < 0 ? 'text-rose-600' : 'text-slate-400'
                        }`}
                      >
                        {net > 0
                          ? formatCurrency(net, group.currency, true)
                          : net < 0
                          ? formatCurrency(net, group.currency, true)
                          : 'Settled'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        groupId={groupId}
        groupCurrency={group.currency}
        allowedCurrencies={allowedCurrencies}
        members={members}
      />

      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        groupId={groupId}
      />

      <SettleDebtModal
        isOpen={showSettle}
        onClose={() => setShowSettle(false)}
        groupId={groupId}
        groupCurrency={group.currency}
        members={members}
        initialFromMemberId={settleFrom}
        initialToMemberId={settleTo}
        initialAmount={settleAmount}
      />

      <GroupSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        groupId={groupId}
        currentName={group.name}
        currentCurrency={group.currency}
        currentAllowedCurrencies={allowedCurrencies}
      />
    </div>
  );
};