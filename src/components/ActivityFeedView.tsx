// src/components/ActivityFeedView.tsx
import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Activity,
  Receipt,
  CheckCircle2,
  UserPlus,
  Loader2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '../utils/currencies';

interface ActivityFeedViewProps {
  onSelectGroup: (groupId: string) => void;
}

export const ActivityFeedView: React.FC<ActivityFeedViewProps> = ({ onSelectGroup }) => {
  const activityData = useQuery((api as any).groups?.getActivityFeed) || [];
  const isLoading = activityData === undefined;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading group activity stream…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 font-sans">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recent Activity
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Live Feed</span>
      </div>

      {activityData.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <Clock className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-600">No Recent Actions</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Expenses, debt settlements, and member joins will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activityData.map((act: any) => {
            const isSettlement = act.type === 'settlement';
            const isMemberJoin = act.type === 'member_join';

            return (
              <button
                key={act._id || act.timestamp}
                onClick={() => act.groupId && onSelectGroup(act.groupId)}
                className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all text-left flex items-start gap-3 group cursor-pointer"
              >
                <div
                  className={`p-2.5 rounded-2xl shrink-0 mt-0.5 ${
                    isSettlement
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      : isMemberJoin
                      ? 'bg-amber-50 text-amber-600 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}
                >
                  {isSettlement ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isMemberJoin ? (
                    <UserPlus className="w-4 h-4" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {act.groupName || 'Trip Group'}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {act.formattedTime || 'Recently'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {act.description}
                  </p>

                  {act.amount !== undefined && (
                    <div className="flex items-center gap-1 pt-0.5">
                      <span className="text-xs font-mono font-bold text-slate-900">
                        {formatCurrency(act.amount, act.currency || 'ALL')}
                      </span>
                      {act.category && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                          {act.category}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 self-center" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};