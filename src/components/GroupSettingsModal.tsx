import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
  X,
  Settings2,
  Check,
  Loader2,
  Search,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { GLOBAL_CURRENCIES, CurrencyInfo } from '../utils/currencies';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: Id<'groups'>;
  currentName: string;
  currentCurrency: string;
  currentAllowedCurrencies: string[];
  /**
   * True if the current user is the group's creator. Passed in from
   * GroupDetailView (which reads Clerk's useUser()). If undefined, the
   * modal optimistically shows owner actions — the backend still rejects
   * non-owners for save/delete.
   */
  isOwner?: boolean;
  isArchived?: boolean;
  onDeleted?: () => void;
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  groupId,
  currentName,
  currentCurrency,
  currentAllowedCurrencies,
  isOwner,
  isArchived,
  onDeleted,
}) => {
  const updateSettingsMutation = useMutation((api as any).groups?.updateGroupSettings);
  const archiveGroupMutation = useMutation((api as any).groups?.archiveGroup);
  const unarchiveGroupMutation = useMutation((api as any).groups?.unarchiveGroup);
  const deleteGroupMutation = useMutation((api as any).groups?.deleteGroup);

  const [name, setName] = useState(currentName);
  const [baseCurrency, setBaseCurrency] = useState<string>(currentCurrency);
  const [allowed, setAllowed] = useState<string[]>(currentAllowedCurrencies);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setBaseCurrency(currentCurrency);
      setAllowed(currentAllowedCurrencies || ['ALL', 'EUR', 'USD']);
      setSearch('');
      setError(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, currentName, currentCurrency, currentAllowedCurrencies]);

  if (!isOpen) return null;

  // Optimistic default: if parent hasn't told us, assume owner so the modal
  // is fully usable; backend enforces owner-only on save/delete regardless.
  const owner = isOwner !== false;

  const toggleAllowed = (code: string) => {
    if (!owner) return;
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
      const message: string =
        err?.message?.replace(/^Uncaught Error:\s*/, '') ??
        'Could not update group settings.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveToggle = async () => {
    setError(null);
    setIsArchiving(true);
    try {
      if (isArchived) {
        await unarchiveGroupMutation({ groupId });
      } else {
        await archiveGroupMutation({ groupId });
      }
      onClose();
    } catch (err: any) {
      const message: string =
        err?.message?.replace(/^Uncaught Error:\s*/, '') ??
        'Could not change archive state.';
      setError(message);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await deleteGroupMutation({ groupId });
      onDeleted?.();
      onClose();
    } catch (err: any) {
      const message: string =
        err?.message?.replace(/^Uncaught Error:\s*/, '') ??
        'Could not delete group.';
      setError(message);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
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
              disabled={!owner}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 disabled:opacity-60"
            />
            {!owner && (
              <p className="text-[10px] text-slate-400 mt-1 px-1">
                Only the group owner can rename or change currencies.
              </p>
            )}
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
                    if (!owner) return;
                    setBaseCurrency(c.code);
                    if (!allowed.includes(c.code)) setAllowed([...allowed, c.code]);
                  }}
                  disabled={!owner}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border truncate disabled:cursor-not-allowed disabled:opacity-60 ${
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
                          disabled={!owner}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
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
                          disabled={!owner}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
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

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {owner && (
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
            </button>
          )}
        </form>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {owner ? 'Owner actions' : 'Group actions'}
          </p>

          <button
            type="button"
            onClick={handleArchiveToggle}
            disabled={isArchiving}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              {isArchived ? (
                <ArchiveRestore className="w-4 h-4 text-slate-500" />
              ) : (
                <Archive className="w-4 h-4 text-slate-500" />
              )}
              <span>{isArchived ? 'Unarchive group' : 'Archive group'}</span>
            </div>
            <span className="text-[10px] text-slate-400">Reversible</span>
          </button>

          {owner && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete group</span>
              </div>
              <span className="text-[10px] text-rose-500">Permanent</span>
            </button>
          )}
        </div>

        {showDeleteConfirm && (
          <div
            onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4 font-sans"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900">Delete this group?</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    This permanently removes <span className="font-semibold">{currentName}</span>,
                    all members, expenses, and settlements. This cannot be undone.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold cursor-pointer hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete forever'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};