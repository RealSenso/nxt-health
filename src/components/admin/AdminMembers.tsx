import React, { useState } from 'react';
import { Check, Copy, GraduationCap, Search, Shield, ShieldOff, UserCheck, X } from 'lucide-react';
import { MembershipStatus, User } from '../../types';
import { store } from '../../services/store';
import { MentorProfileForm } from '../MentorsPage';

const STATUS_LABEL: Record<MembershipStatus, string> = {
  none: 'Not a member',
  requested: 'Requested',
  active: 'Member',
  declined: 'Declined',
};

export const AdminMembers: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [editingMentor, setEditingMentor] = useState<string | null>(null);

  const users = store.getUsers();
  const requests = users
    .filter(u => u.membership_status === 'requested' && u.role !== 'admin')
    .sort((a, b) => (a.membership_requested_at || '').localeCompare(b.membership_requested_at || ''));
  const q = query.trim().toLowerCase();
  const filtered = users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const mentors = store.getMentors();

  const copyId = (id: string) => {
    navigator.clipboard?.writeText(id).catch(() => undefined);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5 sm:p-6">
        <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-[var(--nxt-mint-strong)]" /> Membership requests ({requests.length})
        </h3>
        <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">Approving gives full access to roadmaps, resources, funding applications and mentors. The founder is notified either way.</p>
        {requests.length === 0 ? (
          <p className="text-sm text-[var(--nxt-ink-soft)] mt-4">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {requests.map(u => (
              <li key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[var(--nxt-bg-soft)] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--nxt-ink)]">{u.name}</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)]">
                    {u.email}{u.membership_requested_at ? ` · requested ${new Date(u.membership_requested_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                    {u.background ? ` · ${u.background}` : ''}{u.startup_stage ? ` · ${u.startup_stage.replace('_', '-')}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button id={`btn-approve-member-${u.id}`} onClick={() => store.setMembershipStatus(u.id, 'active')} className="px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] hover:bg-[var(--nxt-mint-deep)] text-white text-sm font-semibold inline-flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => store.setMembershipStatus(u.id, 'declined')} className="px-4 py-2 rounded-full border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink-soft)] inline-flex items-center gap-1.5">
                    <X className="w-4 h-4" /> Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[var(--nxt-line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-[var(--nxt-ink)]">All users ({users.length})</h3>
            <p className="text-sm text-[var(--nxt-ink-soft)]">Change membership, pick mentors, and manage admin access.</p>
          </div>
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-[var(--nxt-ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="w-full pl-9 pr-3 py-2 text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-full text-[var(--nxt-ink)]" />
          </div>
        </div>
        <ul className="divide-y divide-[var(--nxt-line)]">
          {filtered.map(u => (
            <li key={u.id} className="p-4 sm:px-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--nxt-ink)] flex items-center gap-2 flex-wrap">
                    {u.name}
                    {u.role === 'admin' && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)]">Admin</span>}
                    {u.is_mentor && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--nxt-mint)] text-[var(--nxt-mint-deep)]">Mentor</span>}
                  </p>
                  <p className="text-xs text-[var(--nxt-ink-soft)]">{u.email}</p>
                  <button onClick={() => copyId(u.id)} className="mt-1 inline-flex items-center gap-1 text-[11px] font-mono text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-mint-strong)]" title="Copy user ID">
                    <Copy className="w-3 h-3" /> {u.id} {copied === u.id && <span className="text-[var(--nxt-mint-strong)] font-sans font-semibold">Copied</span>}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {u.role !== 'admin' && (
                    <select
                      aria-label={`Membership for ${u.name}`}
                      value={u.membership_status}
                      onChange={(e) => store.setMembershipStatus(u.id, e.target.value as MembershipStatus)}
                      className="text-sm bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)] rounded-full px-3 py-1.5 text-[var(--nxt-ink)]"
                    >
                      {(Object.keys(STATUS_LABEL) as MembershipStatus[]).map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  )}
                  <button
                    onClick={() => store.setMentor(u.id, !u.is_mentor)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 border ${u.is_mentor ? 'border-[var(--nxt-mint-strong)]/40 text-[var(--nxt-mint-deep)]' : 'border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]'}`}
                  >
                    <GraduationCap className="w-4 h-4" /> {u.is_mentor ? 'Remove mentor' : 'Make mentor'}
                  </button>
                  {u.is_mentor && (
                    <button onClick={() => setEditingMentor(editingMentor === u.id ? null : u.id)} className="px-3 py-1.5 rounded-full text-sm font-semibold text-[var(--nxt-mint-strong)] hover:underline">
                      {editingMentor === u.id ? 'Close profile' : 'Edit mentor profile'}
                    </button>
                  )}
                  {u.role === 'admin' ? (
                    <button
                      disabled={u.id === currentUser.id}
                      onClick={() => store.setUserRole(u.id, 'member')}
                      title={u.id === currentUser.id ? "You can't remove your own admin role" : undefined}
                      className="px-3 py-1.5 rounded-full border border-[var(--nxt-peach-deep)]/30 text-[var(--nxt-peach-deep)] text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <ShieldOff className="w-4 h-4" /> Revoke admin
                    </button>
                  ) : (
                    <button
                      onClick={() => { if (window.confirm(`Give ${u.name} full admin access?`)) void store.setUserRole(u.id, 'admin'); }}
                      className="px-3 py-1.5 rounded-full border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)] text-sm font-semibold inline-flex items-center gap-1.5"
                    >
                      <Shield className="w-4 h-4" /> Make admin
                    </button>
                  )}
                </div>
              </div>
              {editingMentor === u.id && (
                <div className="mt-4 rounded-2xl border border-[var(--nxt-line)] p-4">
                  <MentorProfileForm initial={mentors.find(m => m.id === u.id)} forUserId={u.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
