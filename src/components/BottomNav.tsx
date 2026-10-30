import React from 'react';
import { Users, History } from 'lucide-react';

export type SplitTab = 'groups' | 'activity';

interface BottomNavProps {
  active: SplitTab;
  onChange: (tab: SplitTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ active, onChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-2 h-16 px-4">
        <button
          type="button"
          onClick={() => onChange('groups')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            active === 'groups' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[11px]">Groups</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('activity')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
            active === 'activity' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[11px]">Activity</span>
        </button>
      </div>
    </nav>
  );
};