// src/components/SettingsView.tsx
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { ArrowLeft, Check, Globe, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { GLOBAL_CURRENCIES } from '../utils/currencies';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const prefs = useQuery((api as any).preferences?.getMyPreferences, {}) as
    | { baseCurrency: string }
    | undefined;
  const setBaseCurrency = useMutation((api as any).preferences?.setBaseCurrency);

  const [selected, setSelected] = useState<string>('ALL');
  const [isSaving, setIsSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefs?.baseCurrency) setSelected(prefs.baseCurrency);
  }, [prefs?.baseCurrency]);

  const handleSave = async () => {
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await setBaseCurrency({ baseCurrency: selected });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2000);
    } catch (err: any) {
      const msg = err?.message?.replace(/^Uncaught Error:\s*/, '') ?? 'Could not save.';
      setErrorMsg(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const popular = GLOBAL_CURRENCIES.filter((c) => c.popular);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      <header
        className="w-full sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
      >
        <div className="max-w-md mx-auto pb-3 px-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-900 text-base">Settings</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Base Currency</h2>
              <p className="text-[11px] text-slate-500">
                Every aggregate in Splitup and LekFlow shows in this currency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {popular.map((c) => {
              const active = selected === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelected(c.code)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">
                    {c.code} <span className="text-slate-400 font-normal">· {c.name}</span>
                  </span>
                  {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || selected === prefs?.baseCurrency}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? 'Saving…' : savedTick ? 'Saved ✓' : 'Save'}
          </button>
        </div>

        <p className="text-[10px] text-slate-400 px-1">
          Changing base currency affects display only. Every value is still stored in ALL and converted on the fly.
        </p>
      </main>
    </div>
  );
};