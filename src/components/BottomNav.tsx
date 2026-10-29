import React from 'react';
import { Users, History, Scale, Settings } from 'lucide-react';

export type SplitTab = 'groups' | 'activity' | 'balances' | 'settings';

interface BottomNavProps {
  active: SplitTab;
  onChange: (tab: SplitTab) => void;
}

const TABS: { id: SplitTab; label: string; icon: React.ReactNode }[] = [
  { id: 'groups', label: 'Groups', icon: <Users className="w-5 h-5" /> },
  { id: 'activity', label: 'Activity', icon: <History className="w-5 h-5" /> },
  { id: 'balances', label: 'Balances', icon: <Scale className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <div
      className="fixed inset-x-0 z-20 mx-auto max-w-md px-4 pointer-events-none"
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <nav className="pointer-events-auto rounded-3xl border border-slate-200 bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/50">
        <div className="grid grid-cols-4 px-1.5 py-1.5 gap-1">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-2xl text-[10px] font-semibold leading-tight transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};