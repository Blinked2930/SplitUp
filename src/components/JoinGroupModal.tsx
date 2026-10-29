import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Users, Check, Loader2 } from 'lucide-react';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupId: Id<'groups'>) => void;
}

export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const joinGroupMutation = useMutation((api as any).groups?.joinGroup);

  const [groupIdInput, setGroupIdInput] = useState('');
  const [memberName, setMemberName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedId = groupIdInput.trim();
    const trimmedName = memberName.trim();

    if (!trimmedId || !trimmedName) {
      setError('Please provide both the Group ID and your display name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await joinGroupMutation({
        groupId: trimmedId as Id<'groups'>,
        memberName: trimmedName,
      });

      setGroupIdInput('');
      setMemberName('');
      onClose();
      if (res?.groupId) {
        onSuccess(res.groupId);
      }
    } catch (err: any) {
      console.error('Failed to join group:', err);
      setError(err?.message || 'Could not join group. Verify the Group ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 font-sans">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Join Existing Group</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Group Invite ID *
            </label>
            <input
              type="text"
              required
              placeholder="Paste Group ID here"
              value={groupIdInput}
              onChange={(e) => setGroupIdInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Your Name in Group *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || !groupIdInput.trim() || !memberName.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Joining...' : 'Join Group'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};