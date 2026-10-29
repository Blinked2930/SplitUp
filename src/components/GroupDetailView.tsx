import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, Plus, Receipt } from 'lucide-react';
import { AddExpenseModal } from './AddExpenseModal';

interface GroupDetailViewProps {
  groupId: Id<'groups'>;
  onBack: () => void;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId, onBack }) => {
  const details = useQuery((api as any).groups?.getGroupDetails, { groupId });
  const [showAddExpense, setShowAddExpense] = useState(false);

  if (!details) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-medium text-sm">
        Loading group...
      </div>
    );
  }

  const { group, members, expenses } = details;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
      {/* Sticky Header */}
      <header
        className="w-full sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-md mx-auto pb-3 px-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="font-bold text-slate-900 text-base">{group.name}</h2>
            <p className="text-[10px] text-slate-400 font-medium">{members.length} Members</p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Quick Add Expense Action */}
        <button
          type="button"
          onClick={() => setShowAddExpense(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Expense</span>
        </button>

        {/* Members List */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Members</h3>
            <span className="text-xs text-slate-500 font-medium">{group.currency}</span>
          </div>
          <div className="space-y-2">
            {members.map((m: { _id: string; name: string }) => (
              <div key={m._id} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800">{m.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses List */}
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
            expenses.map((exp: { _id: string; title: string; amount: number; currency: string; timestamp: number }) => (
              <div
                key={exp._id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{exp.title}</h4>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {exp.amount} {exp.currency}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  {new Date(exp.timestamp).toLocaleDateString()}
                </p>
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
        members={members}
      />
    </div>
  );
};