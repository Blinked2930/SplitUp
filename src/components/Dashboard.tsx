// src/components/Dashboard.tsx
import React, { useState } from 'react';
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
  History,
  Receipt,
  Scale,
  Settings as SettingsIcon,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { BottomNav, SplitTab } from './BottomNav';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';
import { GroupDetailView } from './GroupDetailView';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SplitTab>('groups');
  const [selectedGroupId, setSelectedGroupId] = useState<Id<'groups'> | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);

  const groups = useQuery((api as any).groups?.getMyGroups || (api as any).groups?.listGroups, {});
  const activities = useQuery((api as any).groups?.getActivityFeed, {});

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
        {/* Overall Balance Summary Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Net Position</p>
              <h2 className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                0 ALL
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

        {/* TAB 1: GROUPS */}
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
                onClick={() => setShowJoinGroup(true)}
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
                groups.map((group: any) => (
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
                          <p className="text-xs text-slate-400 font-medium">{group.currency}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY FEED */}
        {activeTab === 'activity' && (
          <div className="space-y-3 animate-in fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Recent Activity
            </h3>

            {activities === undefined ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 flex justify-center items-center">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                <History className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">No activity recorded across your groups yet.</p>
              </div>
            ) : (
              activities.map((act: any) => (
                <div
                  key={act.id}
                  onClick={() => setSelectedGroupId(act.groupId)}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2 rounded-xl text-xs font-bold ${
                          act.type === 'settlement'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {act.type === 'settlement' ? <Scale className="w-4 h-4" /> : <Receipt className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{act.title}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {act.groupName} • {act.actorName}
                        </p>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {act.amount} {act.currency}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: CROSS-GROUP BALANCES */}
        {activeTab === 'balances' && (
          <div className="space-y-3 animate-in fade-in">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Balances Per Group
            </h3>

            {groups === undefined ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 flex justify-center items-center">
                <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
              </div>
            ) : groups.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2">
                <Scale className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">Join or create a group to view balances.</p>
              </div>
            ) : (
              groups.map((g: any) => (
                <div
                  key={g._id}
                  onClick={() => setSelectedGroupId(g._id)}
                  className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{g.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Currency: {g.currency}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      Active
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Splitup App Settings</h3>
                <p className="text-xs text-slate-400">Version 1.0.0</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Shared Backend</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Convex Active
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600 font-medium">PWA Offline Storage</span>
                <span className="font-bold text-slate-900">Enabled</span>
              </div>
            </div>
          </div>
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
      />

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};

export default Dashboard;