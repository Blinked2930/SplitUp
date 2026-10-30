import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
  ArrowLeft,
  Plus,
  Users,
  TrendingUp,
  TrendingDown,
  Receipt,
  Loader2,
  Share2,
  Check,
} from 'lucide-react';
import { formatCurrency } from '../utils/currencies';
import { AddExpenseModal } from './AddExpenseModal';

interface GroupDetailViewProps {
  groupId: Id<'groups'>;
  onBack: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'expenses'>('balances');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [copied, setCopied] = useState(false);

  const groupDetails = useQuery((api as any).groups?.getGroupDetails, { groupId });

  if (!groupDetails) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const { group, members = [], expenses = [], memberBalances = [] } = groupDetails;
  const currency = group?.currency || 'ALL';
  const inviteCode = group?.inviteCode || groupId.slice(-6).toUpperCase();

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}?join=${inviteCode}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      <header
        className="w-full sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-md mx-auto pb-3 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Groups</span>
          </button>
          <h2 className="font-bold text-slate-900 text-sm truncate max-w-[180px]">{group.name}</h2>
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Share invite link"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Actions Bar */}
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => setShowAddExpense(true)}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="p-1 rounded-2xl bg-slate-200/80 grid grid-cols-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('balances')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'balances' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>Member Balances</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-indigo-600" />
            <span>Expenses ({expenses.length})</span>
          </button>
        </div>

        {/* MEMBER BALANCES ("UP & DOWN") VIEW */}
        {activeTab === 'balances' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Group Net Breakdown
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  {members.length} Members
                </span>
              </div>

              <div className="space-y-2">
                {memberBalances.map((m: any) => {
                  const net = m.netBalance || 0;
                  const isUp = net > 0;
                  const isDown = net < 0;

                  return (
                    <div
                      key={m.userId || m.name}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                        m.isCurrentUser
                          ? 'bg-slate-900 text-white border-slate-800'
                          : 'bg-slate-50 border-slate-200/80 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            m.isCurrentUser
                              ? 'bg-emerald-500 text-white'
                              : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {m.name} {m.isCurrentUser && '(You)'}
                          </p>
                          <p className={`text-[10px] ${m.isCurrentUser ? 'text-slate-400' : 'text-slate-500'}`}>
                            Paid: {formatCurrency(m.totalPaid || 0, currency)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1 font-mono font-bold text-xs">
                          {isUp && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
                          {isDown && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                          <span
                            className={
                              isUp
                                ? 'text-emerald-500'
                                : isDown
                                ? 'text-rose-500'
                                : 'text-slate-400'
                            }
                          >
                            {isUp ? '+' : ''}
                            {formatCurrency(net, currency)}
                          </span>
                        </div>
                        <p className={`text-[9px] font-semibold uppercase tracking-wider ${
                          isUp
                            ? 'text-emerald-500'
                            : isDown
                            ? 'text-rose-500'
                            : 'text-slate-400'
                        }`}>
                          {isUp ? 'Up (gets back)' : isDown ? 'Down (owes)' : 'Settled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* EXPENSES LIST VIEW */}
        {activeTab === 'expenses' && (
          <div className="space-y-2 animate-in fade-in">
            {expenses.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                <Receipt className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No expenses recorded</p>
                <p className="text-[11px] text-slate-400">
                  Tap "Add Expense" to log shared costs for this group.
                </p>
              </div>
            ) : (
              expenses.map((exp: any) => (
                <div
                  key={exp._id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{exp.description}</h4>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(exp.amount, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Paid by {exp.payerName || 'Member'}</span>
                    <span>{new Date(exp._creationTime).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        groupId={groupId}
        members={members}
        groupCurrency={currency}
      />
    </div>
  );
};