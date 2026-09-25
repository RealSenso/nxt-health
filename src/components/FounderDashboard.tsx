import React from 'react';
import {
  Trophy, CalendarDays, Users,
  LayoutDashboard, FolderKanban, Users2, ArrowRight,
  Clock, CheckCircle2, XCircle, PenLine, Sparkles, MessageSquare
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from './ui/PageHeader';
import { Reveal, PillButton } from './ui/Reveal';

interface FounderDashboardProps {
  currentUser: User;
  onNavigateToProblems: () => void;
  onNavigateToFunds: () => void;
  onNavigateToRoadmap: (problemId?: string) => void;
  onOpenTeamModal: () => void;
  onOpenSlackModal: () => void;
  onOpenEditProfile: () => void;
}

const STATUS_BADGE: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  Approved: { icon: CheckCircle2, bg: 'bg-[var(--nxt-mint)]', text: 'text-[var(--nxt-mint-strong)]', label: 'Approved' },
  Rejected: { icon: XCircle, bg: 'bg-[var(--nxt-peach)]', text: 'text-[var(--nxt-peach-deep)]', label: 'Rejected' },
  Draft: { icon: PenLine, bg: 'bg-[var(--nxt-bg-soft)]', text: 'text-[var(--nxt-ink-soft)]', label: 'Draft' },
  Pending: { icon: Clock, bg: 'bg-[var(--nxt-peach)]', text: 'text-[var(--nxt-peach-deep)]', label: 'Pending Review' },
};

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  currentUser,
  onNavigateToProblems,
  onNavigateToFunds,
  onNavigateToRoadmap,
  onOpenTeamModal,
  onOpenSlackModal,
  onOpenEditProfile,
}) => {
  const isMember = currentUser.is_member;
  const checkInDue = isMember && (!currentUser.outcomes ||
    Date.now() - new Date(currentUser.outcomes.updated_at).getTime() > 90 * 86_400_000);
  const scopeKey = store.getScopeKey(currentUser);
  const problems = store.getProblems();

  const applications = store.getScopedApplications(currentUser)
    .slice()
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;

  const savedProblemIds = store.getSavedProblemIds(currentUser.id);
  const savedProblems = problems.filter(p => savedProblemIds.includes(p.id));

  const workingProblemIds = store.getWorkingProblemIds(scopeKey);
  const workingProblems = problems.filter(p => workingProblemIds.includes(p.id));

  const team = store.getMyTeam(currentUser);
  const teamMembers = team ? store.getUsers().filter(u => team.member_ids.includes(u.id)) : [];

  const categories = store.getCategories();
  const scopeProgress = store.getAllProgress().filter(p => p.user_id === scopeKey);
  const touchedCategoryIds = Array.from(new Set(scopeProgress.map(p => p.category_id)));
  const categoryStats = touchedCategoryIds
    .map(id => {
      const category = categories.find(c => c.id === id);
      if (!category) return null;
      const catSteps = store.getSteps(id);
      const done = scopeProgress.filter(p => p.category_id === id && p.completed).length;
      const pct = catSteps.length > 0 ? Math.round((done / catSteps.length) * 100) : 0;
      return { category, done, total: catSteps.length, pct };
    })
    .filter((s): s is { category: typeof categories[number]; done: number; total: number; pct: number } => !!s)
    .sort((a, b) => b.pct - a.pct);

  const projects = workingProblems.map(problem => {
    const categoryId = store.getLockedCategoryId(scopeKey, problem.id);
    const stat = categoryStats.find(c => c.category.id === categoryId);
    const category = categories.find(c => c.id === categoryId);
    const total = categoryId ? store.getSteps(categoryId).length : 0;
    return { problem, category, done: stat?.done ?? 0, total, pct: stat?.pct ?? 0 };
  });

  const stats = [
    { label: 'Applications', value: applications.length, hint: pendingCount ? `${pendingCount} pending` : approvedCount ? `${approvedCount} approved` : '', onClick: onNavigateToFunds },
    { label: 'Saved problems', value: savedProblems.length, hint: '', onClick: onNavigateToProblems },
    { label: 'Team members', value: team ? teamMembers.length : 1, hint: team?.name || 'Solo', onClick: onOpenTeamModal },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Dashboard"
        title={`Welcome back, ${currentUser.name.split(' ')[0]}`}
        actions={!isMember && (
          <PillButton tone="mint" onClick={onNavigateToProblems} className="px-5 py-2.5 text-sm">
            <Sparkles className="w-4 h-4" /> Become a member
          </PillButton>
        )}
      />

      {checkInDue && (
        <Reveal className="rounded-2xl border border-[var(--nxt-mint-strong)]/30 bg-[var(--nxt-mint)] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Trophy className="w-5 h-5 text-[var(--nxt-mint-strong)] shrink-0" />
          <p className="flex-1 text-sm text-[var(--nxt-mint-deep)]">
            <span className="font-bold">Quarterly check-in:</span> any pilots, filings or funding since you joined? It takes 30 seconds.
          </p>
          <PillButton tone="mint" id="btn-open-checkin" onClick={onOpenEditProfile} className="px-4 py-2 text-sm shrink-0">
            Update outcomes
          </PillButton>
        </Reveal>
      )}

      <DashboardInvites />

      <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-bold text-[var(--nxt-ink)] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[var(--nxt-mint-strong)]" /> Your projects
          </h2>
          {projects.length > 0 && (
            <button onClick={() => onNavigateToRoadmap()} className="text-sm font-semibold text-[var(--nxt-mint-strong)] hover:underline flex items-center gap-1">
              All roadmaps <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
        {projects.length === 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[var(--nxt-bg-soft)] p-4">
            <p className="text-sm text-[var(--nxt-ink-soft)]">Pick a clinical problem to start a roadmap — your progress will show up here.</p>
            <PillButton tone="mint" onClick={onNavigateToProblems} className="px-4 py-2 text-sm shrink-0">
              Browse problems <ArrowRight className="w-4 h-4" />
            </PillButton>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--nxt-line)]">
            {projects.map(({ problem, category, done, total, pct }) => (
              <li key={problem.id}>
                <button onClick={() => onNavigateToRoadmap(problem.id)} className="w-full text-left py-3 flex items-center gap-4 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--nxt-ink)] truncate group-hover:text-[var(--nxt-mint-strong)]">{problem.title}</p>
                    <p className="text-xs text-[var(--nxt-ink-soft)] mt-0.5">
                      {category ? `${category.name} · ${done}/${total} steps` : 'Choose what to build'}
                    </p>
                  </div>
                  {category && (
                    <div className="hidden sm:flex items-center gap-2 w-40 shrink-0">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--nxt-bg-soft)] overflow-hidden">
                        <div className="h-full rounded-full bg-[var(--nxt-mint-strong)]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-[var(--nxt-ink-soft)] w-9 text-right">{pct}%</span>
                    </div>
                  )}
                  <ArrowRight className="w-4 h-4 text-[var(--nxt-ink-soft)] group-hover:text-[var(--nxt-mint-strong)] shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Reveal>

      <UpcomingEvents />

      <div className="grid grid-cols-3 gap-3">
        {stats.map(stat => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="text-left bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl px-4 py-3 hover:border-[var(--nxt-mint-strong)]/40 transition-colors"
          >
            <p className="text-xs font-semibold text-[var(--nxt-ink-soft)]">{stat.label}</p>
            <p className="mt-0.5 flex items-baseline gap-2">
              <span className="font-display text-xl font-bold text-[var(--nxt-ink)]">{stat.value}</span>
              {stat.hint && <span className="text-xs text-[var(--nxt-ink-soft)] truncate">{stat.hint}</span>}
            </p>
          </button>
        ))}
      </div>

      {(applications.length > 0 || savedProblems.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {applications.length > 0 && (
            <DashCard title="Recent applications" action="View all" onAction={onNavigateToFunds}>
              {applications.slice(0, 4).map(app => {
                const badge = STATUS_BADGE[app.status];
                const Icon = badge.icon;
                return (
                  <button
                    key={app.id}
                    onClick={onNavigateToFunds}
                    className="w-full flex items-center justify-between gap-3 py-2.5 text-left"
                  >
                    <p className="text-sm font-semibold text-[var(--nxt-ink)] truncate">{app.problem_title || app.startup_name}</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${badge.bg} ${badge.text}`}>
                      <Icon className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </DashCard>
          )}
          {savedProblems.length > 0 && (
            <DashCard title="Saved for later" action="Browse" onAction={onNavigateToProblems}>
              {savedProblems.slice(0, 4).map(p => (
                <button key={p.id} onClick={onNavigateToProblems} className="w-full text-left py-2.5">
                  <p className="text-sm font-semibold text-[var(--nxt-ink)] truncate">{p.title}</p>
                  <p className="text-xs text-[var(--nxt-ink-soft)] truncate">{p.department}</p>
                </button>
              ))}
            </DashCard>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--nxt-ink-soft)]">
        {!team && (
          <button onClick={onOpenTeamModal} className="inline-flex items-center gap-1.5 font-semibold hover:text-[var(--nxt-mint-strong)]">
            <Users2 className="w-4 h-4" /> Invite a co-founder
          </button>
        )}
        <button onClick={onOpenSlackModal} className="inline-flex items-center gap-1.5 font-semibold hover:text-[var(--nxt-mint-strong)]">
          <MessageSquare className="w-4 h-4" /> Join the founder Slack
        </button>
      </div>
    </div>
  );
};

const DashCard: React.FC<{ title: string; action: string; onAction: () => void; children: React.ReactNode }> = ({ title, action, onAction, children }) => (
  <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5">
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-sm font-bold text-[var(--nxt-ink)]">{title}</h2>
      <button onClick={onAction} className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline flex items-center gap-1">
        {action} <ArrowRight className="w-3 h-3" />
      </button>
    </div>
    <div className="divide-y divide-[var(--nxt-line)]">{children}</div>
  </Reveal>
);

const DashboardInvites: React.FC = () => {
  const invites = store.getIncomingInvites();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  if (invites.length === 0) return null;
  const respond = async (id: string, accept: boolean) => {
    setBusy(id);
    setError('');
    try { await store.respondToInvite(id, accept); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong.'); } finally { setBusy(null); }
  };
  return (
    <Reveal className="rounded-3xl border border-[var(--nxt-mint-strong)]/30 bg-[var(--nxt-surface)] p-5 space-y-3">
      <p className="font-display text-base font-bold text-[var(--nxt-ink)] flex items-center gap-2"><Users className="w-5 h-5 text-[var(--nxt-mint-strong)]" /> Team invitations</p>
      {invites.map(inv => (
        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-[var(--nxt-bg-soft)] px-4 py-3">
          <p className="text-sm text-[var(--nxt-ink)]"><strong>{inv.from_name}</strong> invited you to join <strong>{inv.team_name}</strong>. Your roadmap projects will merge into the team's.</p>
          <div className="flex gap-2 shrink-0">
            <button disabled={busy === inv.id} onClick={() => respond(inv.id, true)} className="px-4 py-2 rounded-full bg-[var(--nxt-mint-strong)] text-white text-sm font-semibold disabled:opacity-60">Accept</button>
            <button disabled={busy === inv.id} onClick={() => respond(inv.id, false)} className="px-4 py-2 rounded-full border border-[var(--nxt-line)] text-sm font-semibold text-[var(--nxt-ink-soft)]">Decline</button>
          </div>
        </div>
      ))}
      {error && <p className="text-sm text-[var(--nxt-peach-deep)] font-semibold">{error}</p>}
    </Reveal>
  );
};

const UpcomingEvents: React.FC = () => {
  const navigate = useNavigate();
  const resources = store.getResources();
  const items = [
    ...store.getMyRsvpIds().map(id => {
      const r = resources.find(x => x.id === id);
      return r ? { id: r.id, title: r.title, when: r.starts_at, label: r.starts_at ? undefined : r.date } : null;
    }),
    ...store.getMyBookings().map(b => {
      const r = resources.find(x => x.id === b.resource_id);
      return r ? { id: r.id, title: r.title, when: b.slot, label: undefined } : null;
    }),
  ]
    .filter((x): x is { id: string; title: string; when: string | undefined; label: string | undefined } => !!x)
    .filter(x => !x.when || new Date(x.when).getTime() > Date.now() - 3_600_000)
    .sort((a, b) => (a.when || '9').localeCompare(b.when || '9'));
  if (items.length === 0) return null;
  return (
    <Reveal className="rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5">
      <p className="font-display text-base font-bold text-[var(--nxt-ink)] flex items-center gap-2 mb-3"><CalendarDays className="w-5 h-5 text-[var(--nxt-mint-strong)]" /> Upcoming events</p>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={`${item.id}-${item.when}`}>
            <button onClick={() => navigate(`/resources/${item.id}`)} className="w-full text-left flex items-center justify-between gap-3 rounded-2xl bg-[var(--nxt-bg-soft)] px-4 py-3 hover:bg-[var(--nxt-mint)]/30">
              <span className="text-sm font-semibold text-[var(--nxt-ink)]">{item.title}</span>
              <span className="text-xs text-[var(--nxt-ink-soft)] shrink-0">
                {item.when ? new Date(item.when).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Reveal>
  );
};
