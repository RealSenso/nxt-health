import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users2, Mail, UserMinus, LogOut, Crown, AlertCircle, Check, Clock, Globe } from 'lucide-react';
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
  const [busy, setBusy] = useState(false);
  const team = store.getMyTeam(currentUser);
  const [tagline, setTagline] = useState(team?.tagline || '');
  const [website, setWebsite] = useState(team?.website || '');

  if (!isOpen) return null;

  const members = team ? store.getUsers().filter(u => team.member_ids.includes(u.id)) : [];
  const isOwner = team?.owner_id === currentUser.id;
  const incoming = store.getIncomingInvites();
  const outgoing = store.getOutgoingInvites();

  const run = async (action: () => Promise<unknown>, successMessage?: string) => {
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await action();
      if (successMessage) setSuccess(successMessage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSuccess('');
    const result = await store.inviteTeammateByEmail(currentUser, inviteEmail);
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.registered
        ? `Invitation sent. ${inviteEmail} will see it next time they open NxT Health.`
        : `Invitation saved. ${inviteEmail} will see it as soon as they sign up with that email.`);
      setInviteEmail('');
    }
  };

  const handleRemove = async (memberId: string, name: string) => {
    if (window.confirm(`Remove ${name} from your team? They'll keep their own account but lose access to shared projects.`)) {
      const result = await store.removeTeammate(currentUser, memberId);
      if (result.error) setError(result.error);
    }
  };

  const handleLeave = () => {
    if (window.confirm("Leave this team? You'll keep your own account, but lose access to the shared projects and applications.")) {
      void run(() => store.leaveTeam(currentUser)).then(onClose);
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

          {incoming.length > 0 && (
            <div className="mb-5 space-y-2">
              <p className="text-xs font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider">Invitations for you</p>
              {incoming.map(inv => (
                <div key={inv.id} className="rounded-2xl border border-[var(--nxt-mint-strong)]/30 bg-[var(--nxt-mint)]/40 p-3">
                  <p className="text-sm text-[var(--nxt-ink)]"><strong>{inv.from_name}</strong> invited you to join <strong>{inv.team_name}</strong>.</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">Joining merges your roadmap projects into the team's shared workspace.</p>
                  <div className="flex gap-2 mt-2.5">
                    <button id={`btn-accept-invite-${inv.id}`} disabled={busy || !!team} onClick={() => run(() => store.respondToInvite(inv.id, true), `You joined ${inv.team_name}.`)} className="px-3.5 py-1.5 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-60 text-white text-xs font-semibold">
                      Accept
                    </button>
                    <button disabled={busy} onClick={() => run(() => store.respondToInvite(inv.id, false), 'Invitation declined.')} className="px-3.5 py-1.5 rounded-full border border-[var(--nxt-line)] text-xs font-semibold text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-surface)]">
                      Decline
                    </button>
                  </div>
                  {team && <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-2">Leave your current team first to accept.</p>}
                </div>
              ))}
            </div>
          )}

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
                disabled={busy}
                className="px-4 py-2 disabled:opacity-60 bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white rounded-full text-xs font-semibold shrink-0 transition-colors"
              >
                Invite
              </button>
            </div>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-1.5">
              They'll see the invitation in NxT Health and can accept or decline. If they haven't signed up yet, it waits for them.
            </p>
          </form>

          {outgoing.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-xs font-bold text-[var(--nxt-ink-soft)] uppercase tracking-wider">Pending invitations</p>
              {outgoing.map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-2 rounded-xl bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] px-3 py-2">
                  <span className="text-xs text-[var(--nxt-ink)] flex items-center gap-1.5 min-w-0"><Clock className="w-3.5 h-3.5 shrink-0 text-[var(--nxt-ink-soft)]" /><span className="truncate">{inv.to_email}</span></span>
                  <button onClick={() => store.cancelInvite(inv.id)} className="text-xs font-semibold text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-peach-deep)] shrink-0">Cancel</button>
                </div>
              ))}
            </div>
          )}

          {team && isOwner && (
            <div className="mt-5 pt-4 border-t border-[var(--nxt-line)] space-y-2.5">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-sm font-semibold text-[var(--nxt-ink)] flex items-center gap-2"><Globe className="w-4 h-4 text-[var(--nxt-mint-strong)]" /> Public team page</span>
                <input
                  type="checkbox"
                  checked={!!team.is_public}
                  onChange={(e) => run(() => store.updateMyTeam({ is_public: e.target.checked }))}
                  className="w-5 h-5 accent-[var(--nxt-mint-strong)]"
                />
              </label>
              <p className="text-xs text-[var(--nxt-ink-soft)]">Shows your team name, tagline and website. Members appear only if their own profile is public.</p>
              <input value={tagline} maxLength={160} onChange={(e) => setTagline(e.target.value)} placeholder="Tagline — e.g. Continuous sepsis prediction for surgical ICUs" className="w-full px-3 py-2 text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-xl text-[var(--nxt-ink)]" />
              <div className="flex gap-2">
                <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourstartup.com" className="flex-1 px-3 py-2 text-xs bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-xl text-[var(--nxt-ink)]" />
                <button disabled={busy} onClick={() => run(() => store.updateMyTeam({ tagline: tagline.trim(), website: website.trim() }), 'Team page saved.')} className="px-3.5 py-2 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] disabled:opacity-60 text-white text-xs font-semibold">
                  Save
                </button>
              </div>
              {team.is_public && (
                <a href={`${import.meta.env.BASE_URL}teams/${team.id}`} target="_blank" rel="noreferrer" className="inline-flex text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline">View public team page →</a>
              )}
            </div>
          )}

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
