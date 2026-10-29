import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Plus, Users, ArrowUpRight, ArrowDownLeft, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { BottomNav, SplitTab } from './BottomNav';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SplitTab>('groups');
  const groups = useQuery(api.groups.getMyGroups, {});

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
      {/* Sticky Header without Clerk Avatar */}
      <header
        className="w-full sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-md mx-auto pb-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              S
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">Splitup</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Overall Balance Summary */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Balance</p>
              <h2 className="text-2xl font-black text-slate-900 font-mono mt-0.5">0 ALL</h2>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium">You get back</p>
                <p className="text-xs font-bold text-emerald-700 font-mono">0 ALL</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium">You owe</p>
                <p className="text-xs font-bold text-rose-700 font-mono">0 ALL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-xs shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Group</span>
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-emerald-600" />
            <span>Join Group</span>
          </button>
        </div>

        {/* Live Groups Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Groups</h3>
            <span className="text-xs text-slate-500 font-medium">
              {groups ? `${groups.length} Active` : 'Loading...'}
            </span>
          </div>

          {groups === undefined ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 flex justify-center items-center">
              <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
              <p className="text-sm font-bold text-slate-700">No groups yet</p>
              <p className="text-xs text-slate-400">Create or join a group to start splitting expenses.</p>
            </div>
          ) : (
            groups.map((group: any) => (
              <div
                key={group._id}
                className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                      👥
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{group.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{group.currency}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating Glassmorphic Navigation */}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;