import React from 'react';
import { Users, History, Scale } from 'lucide-react';

export type SplitTab = 'groups' | 'activity' | 'balances';

interface BottomNavProps {
  active: SplitTab;
  onChange: (tab: SplitTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-md mx-auto grid grid-cols-3 pt-2 px-4">
        <button
          type="button"
          onClick={() => onChange('groups')}
          className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
            active === 'groups' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold">Groups</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('activity')}
          className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
            active === 'activity' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">Activity</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('balances')}
          className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
            active === 'balances' ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span className="text-[10px] font-bold">Balances</span>
        </button>
      </div>
    </nav>
  );
};