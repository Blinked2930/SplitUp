import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Settings2, Check, Loader2, Search } from 'lucide-react';
import { GLOBAL_CURRENCIES, CurrencyInfo } from '../utils/currencies';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: Id<'groups'>;
  currentName: string;
  currentCurrency: string;
  currentAllowedCurrencies: string[];
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  currentName,
  currentCurrency,
  currentAllowedCurrencies,
}) => {
  const updateSettingsMutation = useMutation((api as any).groups?.updateGroupSettings);

  const [name, setName] = useState(currentName);
  const [baseCurrency, setBaseCurrency] = useState<string>(currentCurrency);
  const [allowed, setAllowed] = useState<string[]>(currentAllowedCurrencies);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setBaseCurrency(currentCurrency);
      setAllowed(currentAllowedCurrencies || ['ALL', 'EUR', 'USD']);
    }
  }, [isOpen, currentName, currentCurrency, currentAllowedCurrencies]);

  if (!isOpen) return null;

  const toggleAllowed = (code: string) => {
    if (allowed.includes(code)) {
      if (allowed.length > 1) {
        setAllowed(allowed.filter((item) => item !== code));
      }
    } else {
      setAllowed([...allowed, code]);
    }
  };

  const filteredCurrencies = GLOBAL_CURRENCIES.filter(
    (c: CurrencyInfo) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const popularCurrencies = filteredCurrencies.filter((c: CurrencyInfo) => c.popular);
  const otherCurrencies = filteredCurrencies.filter((c: CurrencyInfo) => !c.popular);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Group name cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSettingsMutation({
        groupId,
        name: name.trim(),
        currency: baseCurrency,
        allowedCurrencies: allowed,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to update group settings:', err);
      setError('Could not update group settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 font-sans max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Settings2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Group Currency Settings</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Project Currencies Selection
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search currency (e.g. CAD, Yen, Franc)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Base Settlement Currency (Main Group Currency)
            </label>
            <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              {filteredCurrencies.map((c: CurrencyInfo) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setBaseCurrency(c.code);
                    if (!allowed.includes(c.code)) setAllowed([...allowed, c.code]);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border truncate ${
                    baseCurrency === c.code
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.code}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Allowed Secondary Currencies
            </label>
            <p className="text-[10px] text-slate-400">
              Members can submit expenses in these currencies, which automatically convert into {baseCurrency}.
            </p>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {popularCurrencies.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Popular
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {popularCurrencies.map((c: CurrencyInfo) => {
                      const isSelected = allowed.includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => toggleAllowed(c.code)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="truncate">{c.code} - {c.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {otherCurrencies.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    All Currencies
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {otherCurrencies.map((c: CurrencyInfo) => {
                      const isSelected = allowed.includes(c.code);
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => toggleAllowed(c.code)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          <span className="truncate">{c.code} - {c.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>{isSubmitting ? 'Saving...' : 'Save Currency Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};