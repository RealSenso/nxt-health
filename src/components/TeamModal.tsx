import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users2, Mail, UserMinus, LogOut, Crown, AlertCircle, Check } from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const team = store.getMyTeam(currentUser);
  const members = team ? store.getUsers().filter(u => team.member_ids.includes(u.id)) : [];
  const isOwner = team?.owner_id === currentUser.id;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = store.inviteTeammateByEmail(currentUser, inviteEmail);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Invited! ${inviteEmail} now shares this workspace.`);
      setInviteEmail('');
    }
  };

  const handleRemove = (memberId: string, name: string) => {
    if (window.confirm(`Remove ${name} from your team? They'll keep their own account but lose access to shared projects.`)) {
      const result = store.removeTeammate(currentUser, memberId);
      if (result.error) setError(result.error);
    }
  };

  const handleLeave = () => {
    if (window.confirm("Leave this team? You'll keep your own account, but lose access to the shared projects and applications.")) {
      store.leaveTeam(currentUser);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-4 py-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[var(--nxt-surface)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[var(--nxt-line)]"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)] p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
              <Users2 className="w-4 h-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)]">
              {team ? team.name : 'Bring in a co-founder'}
            </h3>
          </div>
          <p className="text-xs text-[var(--nxt-ink-soft)] mb-5">
            Teammates share the same working problems, funding applications, and roadmap progress —
            picking up exactly where each other left off.
          </p>

          {members.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider mb-2">
                Team Members ({members.length})
              </p>
              <div className="space-y-1.5">
                {members.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[var(--nxt-ink)] truncate flex items-center gap-1">
                          {m.name}
                          {m.id === team?.owner_id && <Crown className="w-3 h-3 text-[var(--nxt-peach-deep)]" />}
                        </p>
                        <p className="text-[11px] text-[var(--nxt-ink-soft)] truncate">{m.email}</p>
                      </div>
                    </div>
                    {isOwner && m.id !== currentUser.id && (
                      <button
                        onClick={() => handleRemove(m.id, m.name)}
                        title="Remove from team"
                        className="text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] p-1 shrink-0"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleInvite} className="mb-2">
            <label className="block text-xs font-bold text-[var(--nxt-ink)] uppercase tracking-wider mb-1.5">
              Invite a Co-Founder
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="cofounder@startup.com"
                  required
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)] focus:ring-2 focus:ring-[var(--nxt-mint-strong)] focus:outline-hidden focus:bg-[var(--nxt-surface)] transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold shrink-0 transition-colors"
              >
                Invite
              </button>
            </div>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-1.5">
              They need an existing NxT Health account — no real email is sent.
            </p>
          </form>

          {error && (
            <div className="mt-3 p-2.5 rounded-xl bg-[var(--nxt-peach)] border border-[var(--nxt-peach-deep)]/30 text-[var(--nxt-peach-deep)] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mt-3 p-2.5 rounded-xl bg-[var(--nxt-mint)]/50 border border-[var(--nxt-mint-strong)]/30 text-[var(--nxt-mint-deep)] text-xs font-semibold flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {team && (
            <div className="mt-5 pt-4 border-t border-[var(--nxt-line)]">
              <button
                onClick={handleLeave}
                className="px-3 py-1.5 border border-[var(--nxt-peach-deep)]/30 hover:bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Team</span>
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
