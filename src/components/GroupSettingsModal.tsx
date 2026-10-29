import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Settings2, Check, Loader2 } from 'lucide-react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: Id<'groups'>;
  currentName: string;
  currentCurrency: 'ALL' | 'EUR' | 'USD';
  currentAllowedCurrencies: Array<'ALL' | 'EUR' | 'USD'>;
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
  const [baseCurrency, setBaseCurrency] = useState<'ALL' | 'EUR' | 'USD'>(currentCurrency);
  const [allowed, setAllowed] = useState<Array<'ALL' | 'EUR' | 'USD'>>(currentAllowedCurrencies);
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

  const toggleAllowed = (c: 'ALL' | 'EUR' | 'USD') => {
    if (allowed.includes(c)) {
      if (allowed.length > 1) {
        setAllowed(allowed.filter((item) => item !== c));
      }
    } else {
      setAllowed([...allowed, c]);
    }
  };

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
            <h3 className="text-lg font-bold text-slate-900">Group Settings</h3>
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

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Base Settlement Currency *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['ALL', 'EUR', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setBaseCurrency(curr)}
                  className={`py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                    baseCurrency === curr
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Allowed Expense Currencies
            </label>
            <p className="text-[10px] text-slate-400">
              Members can submit expenses in these currencies. They automatically calculate into your base currency.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['ALL', 'EUR', 'USD'] as const).map((curr) => {
                const isSelected = allowed.includes(curr);
                return (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => toggleAllowed(curr)}
                    className={`py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{curr}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};