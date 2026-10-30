// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
  Plus,
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  ChevronRight,
  Loader2,
  Share2,
  Check,
} from 'lucide-react';
import { BottomNav, SplitTab } from './BottomNav';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';
import { GroupDetailView } from './GroupDetailView';
import { GlobalBalancesView } from './GlobalBalancesView';
import { ActivityFeedView } from './ActivityFeedView';
import { formatCurrency } from '../utils/currencies';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SplitTab>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<Id<'groups'> | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [deepLinkCode, setDeepLinkCode] = useState<string | undefined>(undefined);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const groups = useQuery((api as any).groups?.getMyGroups || (api as any).groups?.listGroups, {});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinParam = params.get('join');
    if (joinParam) {
      setDeepLinkCode(joinParam.trim().toUpperCase());
      setShowJoinGroup(true);
    }
  }, []);

  const handleCopyInviteLink = (e: React.MouseEvent, codeOrId: string) => {
    e.stopPropagation();
    const inviteUrl = `${window.location.origin}?join=${codeOrId}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedCode(codeOrId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  let totalReceivableALL = 0;
  let totalPayableALL = 0;

  if (Array.isArray(groups)) {
    for (const group of groups) {
      const net = group.myNetBalanceALL || 0;
      if (net > 0) totalReceivableALL += net;
      else if (net < 0) totalPayableALL += Math.abs(net);
    }
  }

  const overallNetPosition = totalReceivableALL - totalPayableALL;

  if (selectedGroupId) {
    return (
      <GroupDetailView
        groupId={selectedGroupId}
        onBack={() => setSelectedGroupId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-32 font-sans">
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

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Net Position</p>
              <h2
                className={`text-2xl font-black font-mono mt-0.5 ${
                  overallNetPosition > 0
                    ? 'text-emerald-600'
                    : overallNetPosition < 0
                    ? 'text-rose-600'
                    : 'text-slate-900'
                }`}
              >
                {overallNetPosition > 0 ? '+' : ''}
                {formatCurrency(overallNetPosition, 'ALL')}
              </h2>
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
                <p className="text-xs font-bold text-emerald-700 font-mono">
                  {formatCurrency(totalReceivableALL, 'ALL')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-rose-50/60 border border-rose-100">
              <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-medium">You owe</p>
                <p className="text-xs font-bold text-rose-700 font-mono">
                  {formatCurrency(totalPayableALL, 'ALL')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'groups' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 text-white font-semibold text-xs shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>New Group</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeepLinkCode(undefined);
                  setShowJoinGroup(true);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Join Group</span>
              </button>
            </div>

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
                groups.map((group: any) => {
                  const displayCode = group.inviteCode || group._id.slice(-6).toUpperCase();
                  const net = group.myNetBalanceALL || 0;

                  return (
                    <div
                      key={group._id}
                      onClick={() => setSelectedGroupId(group._id)}
                      className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                            👥
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{group.name}</h4>
                            <p className="text-xs text-slate-400 font-medium">{group.currency || 'ALL'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p
                              className={`text-xs font-mono font-bold ${
                                net > 0
                                  ? 'text-emerald-600'
                                  : net < 0
                                  ? 'text-rose-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {net > 0 ? '+' : ''}
                              {formatCurrency(net, group.currency || 'ALL')}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {net > 0 ? 'get back' : net < 0 ? 'you owe' : 'settled'}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                          Code: {displayCode}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyInviteLink(e, displayCode)}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl cursor-pointer"
                        >
                          {copiedCode === displayCode ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Link Copied</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3" />
                              <span>Copy Invite Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <ActivityFeedView onSelectGroup={(id) => setSelectedGroupId(id as any)} />
        )}

        {activeTab === 'balances' && (
          <GlobalBalancesView onSelectGroup={(id) => setSelectedGroupId(id as any)} />
        )}
      </main>

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={(id: any) => setSelectedGroupId(id)}
      />

      <JoinGroupModal
        isOpen={showJoinGroup}
        onClose={() => setShowJoinGroup(false)}
        onSuccess={(id: any) => setSelectedGroupId(id)}
        initialCode={deepLinkCode}
      />

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;