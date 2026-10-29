import React, { useState, useMemo } from 'react';
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
  Pencil,
  Settings2,
} from 'lucide-react';
import { AddExpenseModal } from './AddExpenseModal';
import { AddMemberModal } from './AddMemberModal';
import { SettleDebtModal } from './SettleDebtModal';
import { EditExpenseModal } from './EditExpenseModal';
import { GroupSettingsModal } from './GroupSettingsModal';
import { calculateBalances, simplifyDebts } from '../utils/debtCalculator';

interface GroupDetailViewProps {
  groupId: Id<'groups'>;
  onBack: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, onBack }) => {
  const details = useQuery((api as any).groups?.getGroupDetails, { groupId });

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const [settleFrom, setSettleFrom] = useState<string | undefined>();
  const [settleTo, setSettleTo] = useState<string | undefined>();
  const [settleAmount, setSettleAmount] = useState<number | undefined>();

  const balances = useMemo(() => {
    if (!details) return new Map<string, number>();
    return calculateBalances(details.members, details.expenses, details.settlements || []);
  }, [details]);

  const simplifiedDebts = useMemo(() => {
    if (!details) return [];
    return simplifyDebts(details.members, balances);
  }, [details, balances]);

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

  const totalGroupSpent = useMemo(() => {
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
  const inviteCode = group.inviteCode || group._id.slice(-6).toUpperCase();

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}?join=${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickSettle = (fromId: string, toId: string, amount: number) => {
    setSettleFrom(fromId);
    setSettleTo(toId);
    setSettleAmount(amount);
    setShowSettle(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
      <header
        className="w-full sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-md mx-auto pb-3 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-slate-900 text-base">{group.name}</h2>
            <p className="text-[10px] text-slate-400 font-medium">Code: {inviteCode}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Group Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="p-2 -mr-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Copy Invite Link"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
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

        {/* Suggested Settlements */}
        {simplifiedDebts.length > 0 && (
          <div className="p-4 rounded-3xl bg-emerald-50/60 border border-emerald-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Suggested Settlements
            </h3>
            <div className="space-y-2">
              {simplifiedDebts.map((debt, idx) => (
                <div
                  key={idx}
                  onClick={() => handleQuickSettle(debt.fromMemberId, debt.toMemberId, debt.amountALL)}
                  className="flex items-center justify-between bg-white p-3 rounded-2xl border border-emerald-200/60 shadow-sm text-xs font-medium cursor-pointer hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{debt.fromName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">{debt.toName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700">
                      {debt.amountALL} {group.currency}
                    </span>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[10px]"
                    >
                      Pay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Group Volume */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Group Volume
                </p>
                <p className="text-base font-black text-slate-900 font-mono">
                  {totalGroupSpent} {group.currency}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <PieChart className="w-3.5 h-3.5 text-emerald-600" />
              <span>Breakdown</span>
              {showBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showBreakdown && (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              {categoryTotals.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat.category}</span>
                    <span className="font-mono text-slate-900">
                      {cat.amount} {group.currency} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
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
            expenses.map((exp: any) => (
              <div
                key={exp._id}
                onClick={() => setSelectedExpense(exp)}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{exp.title}</h4>
                    <Pencil className="w-3 h-3 text-slate-300" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {exp.category && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                        {exp.category}
                      </span>
                    )}
                    {exp.currency !== group.currency && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold">
                        {exp.amount} {exp.currency}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    {new Date(exp.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {exp.amountInALL || exp.amount} {group.currency}
                </span>
              </div>
            ))
          )}
        </div>
      </main>

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        groupId={groupId}
        groupCurrency={group.currency}
        allowedCurrencies={group.allowedCurrencies || ['ALL', 'EUR', 'USD']}
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

      <EditExpenseModal
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        expense={selectedExpense}
        groupCurrency={group.currency}
        members={members}
      />

      <GroupSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        groupId={groupId}
        currentName={group.name}
        currentCurrency={group.currency}
        currentAllowedCurrencies={group.allowedCurrencies || ['ALL', 'EUR', 'USD']}
      />
    </div>
  );
};