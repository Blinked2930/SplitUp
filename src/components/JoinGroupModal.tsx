import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { X, Users, Check, Loader2, UserCheck, PlusCircle, ArrowRight } from 'lucide-react';

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
  const [groupIdInput, setGroupIdInput] = useState('');
  const [validatedGroupId, setValidatedGroupId] = useState<Id<'groups'> | null>(null);
  const [memberName, setMemberName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unclaimedData = useQuery(
    (api as any).groups?.getUnclaimedMembers,
    validatedGroupId ? { groupId: validatedGroupId } : 'skip'
  );

  const joinGroupMutation = useMutation((api as any).groups?.joinGroup);
  const claimMemberMutation = useMutation((api as any).groups?.claimMember);

  if (!isOpen) return null;

  const handleValidateGroupId = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = groupIdInput.trim();
    if (!trimmed) {
      setError('Please enter a valid Group ID.');
      return;
    }
    setValidatedGroupId(trimmed as Id<'groups'>);
  };

  const handleClaimProfile = async (memberId: Id<'groupMembers'>, originalName: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await claimMemberMutation({
        memberId,
        name: memberName.trim() || originalName,
      });
      handleClose();
      if (res?.groupId) onSuccess(res.groupId);
    } catch (err: any) {
      console.error('Failed to claim profile:', err);
      setError(err?.message || 'Could not claim profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinAsNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatedGroupId) return;
    const trimmedName = memberName.trim();
    if (!trimmedName) {
      setError('Please enter your display name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await joinGroupMutation({
        groupId: validatedGroupId,
        memberName: trimmedName,
      });
      handleClose();
      if (res?.groupId) onSuccess(res.groupId);
    } catch (err: any) {
      console.error('Failed to join group:', err);
      setError(err?.message || 'Could not join group.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setGroupIdInput('');
    setValidatedGroupId(null);
    setMemberName('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl border-t sm:border border-slate-200 shadow-2xl p-6 space-y-4 font-sans max-h-[85vh] overflow-y-auto"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {validatedGroupId ? 'Claim Your Profile' : 'Join Existing Group'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!validatedGroupId ? (
          <form onSubmit={handleValidateGroupId} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Paste Group Invite ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. jx7842a..."
                value={groupIdInput}
                onChange={(e) => setGroupIdInput(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={!groupIdInput.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Find Group</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : unclaimedData === undefined ? (
          <div className="py-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-medium">Locating group profiles...</p>
          </div>
        ) : unclaimedData === null ? (
          <div className="py-4 text-center space-y-3">
            <p className="text-xs text-rose-600 font-bold">Group not found or deleted.</p>
            <button
              type="button"
              onClick={() => setValidatedGroupId(null)}
              className="text-xs text-slate-600 underline font-semibold cursor-pointer"
            >
              Try another ID
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-400">Joining: </span>
              <span className="font-bold text-slate-900">{unclaimedData.groupName}</span>
            </div>

            {unclaimedData.unclaimedMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Unclaimed Profiles in Group
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {unclaimedData.unclaimedMembers.map((m: { _id: Id<'groupMembers'>; name: string }) => (
                    <div
                      key={m._id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">{m.name}</span>
                      </div>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleClaimProfile(m._id, m.name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Claim</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleJoinAsNew} className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Or Join As New Member
              </p>
              <input
                type="text"
                placeholder="Your name (e.g. Alex)"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500"
              />

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting || !memberName.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                )}
                <span>Create & Join Profile</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};