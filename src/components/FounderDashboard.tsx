import React from 'react';
import {
  LayoutDashboard, DollarSign, Bookmark, FolderKanban, Users2, ArrowRight,
  Clock, CheckCircle2, XCircle, PenLine, ShieldCheck, Sparkles, MessageSquare
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';
import { Reveal, RevealGroup, RevealItem, PillButton } from './ui/Reveal';

interface FounderDashboardProps {
  currentUser: User;
  onNavigateToProblems: () => void;
  onNavigateToFunds: () => void;
  onNavigateToRoadmap: (problemId?: string) => void;
  onOpenTeamModal: () => void;
  onOpenSlackModal: () => void;
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
}) => {
  const isMember = currentUser.is_member;
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
  const overallRoadmapPct = categoryStats.length > 0
    ? Math.round(categoryStats.reduce((sum, s) => sum + s.pct, 0) / categoryStats.length)
    : 0;

  return (
    <div className="space-y-6">
      <Reveal className="bg-[var(--nxt-surface)] rounded-2xl border border-[var(--nxt-line)] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-[var(--nxt-ink)]">
              Welcome back, {currentUser.name.split(' ')[0]}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--nxt-ink-soft)]">
            Here's where your applications, roadmap, and team stand right now.
          </p>
        </div>
        {!isMember && (
          <PillButton tone="mint" onClick={onNavigateToProblems} className="px-4 py-2.5 text-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Become a Member to Unlock Funding & Roadmaps</span>
          </PillButton>
        )}
      </Reveal>

      <RevealGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.05}>
        <RevealItem>
          <button
            onClick={onNavigateToFunds}
            className="w-full text-left bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-4 shadow-sm hover:border-[var(--nxt-mint-strong)]/40 transition-colors h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]">
                <DollarSign className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)]">Applications</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--nxt-ink)]">{applications.length}</p>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5">
              {pendingCount} pending &middot; {approvedCount} approved
            </p>
          </button>
        </RevealItem>

        <RevealItem>
          <button
            onClick={onNavigateToProblems}
            className="w-full text-left bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-4 shadow-sm hover:border-[var(--nxt-blue-strong)]/40 transition-colors h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-blue)] text-[var(--nxt-blue-strong)]">
                <Bookmark className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)]">Saved Problems</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--nxt-ink)]">{savedProblems.length}</p>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5">Still deciding on these</p>
          </button>
        </RevealItem>

        <RevealItem>
          <button
            onClick={() => onNavigateToRoadmap()}
            className="w-full text-left bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-4 shadow-sm hover:border-[var(--nxt-lavender-strong)]/40 transition-colors h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-lavender)] text-[var(--nxt-lavender-strong)]">
                <FolderKanban className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)]">Roadmap Progress</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--nxt-ink)]">{overallRoadmapPct}%</p>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5">
              {categoryStats.length > 0 ? `across ${categoryStats.length} categor${categoryStats.length === 1 ? 'y' : 'ies'}` : 'not started yet'}
            </p>
          </button>
        </RevealItem>

        <RevealItem>
          <button
            onClick={onOpenTeamModal}
            className="w-full text-left bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-4 shadow-sm hover:border-[var(--nxt-peach-deep)]/40 transition-colors h-full"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]">
                <Users2 className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)]">Team</span>
            </div>
            <p className="font-display text-2xl font-bold text-[var(--nxt-ink)]">{team ? teamMembers.length : 0}</p>
            <p className="text-[11px] text-[var(--nxt-ink-soft)] mt-0.5">{team ? team.name : 'No team yet'}</p>
          </button>
        </RevealItem>
      </RevealGroup>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--nxt-ink)]">Recent Applications</h2>
              <button
                onClick={onNavigateToFunds}
                className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {applications.length === 0 ? (
              <p className="text-xs text-[var(--nxt-ink-soft)] py-4 text-center">
                No funding applications yet — apply from any problem statement's card.
              </p>
            ) : (
              <div className="space-y-2">
                {applications.slice(0, 4).map(app => {
                  const badge = STATUS_BADGE[app.status];
                  const Icon = badge.icon;
                  return (
                    <button
                      key={app.id}
                      onClick={onNavigateToFunds}
                      className="w-full flex items-center justify-between gap-3 bg-[var(--nxt-bg-soft)] hover:bg-[var(--nxt-line)]/40 rounded-xl px-3.5 py-2.5 text-left transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--nxt-ink)] truncate">{app.problem_title || app.startup_name}</p>
                        <p className="text-[11px] text-[var(--nxt-ink-soft)] truncate">{app.startup_name}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${badge.bg} ${badge.text}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Reveal>

          <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--nxt-ink)]">Roadmap Progress by Category</h2>
              <button
                onClick={() => onNavigateToRoadmap()}
                className="text-xs font-semibold text-[var(--nxt-blue-strong)] hover:underline flex items-center gap-1"
              >
                Open roadmaps <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {categoryStats.length === 0 ? (
              <p className="text-xs text-[var(--nxt-ink-soft)] py-4 text-center">
                Pick a problem to work on and start checking off roadmap steps to see progress here.
              </p>
            ) : (
              <div className="space-y-3">
                {categoryStats.slice(0, 5).map(({ category, pct, done, total }) => (
                  <div key={category.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-[var(--nxt-ink)]">{category.name}</span>
                      <span className="text-[var(--nxt-ink-soft)]">{done}/{total} &middot; {pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[var(--nxt-bg-soft)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--nxt-blue-strong)] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        <div className="space-y-6">
          <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--nxt-ink)]">Saved for Later</h2>
              <button
                onClick={onNavigateToProblems}
                className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline flex items-center gap-1"
              >
                Browse <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {savedProblems.length === 0 ? (
              <p className="text-xs text-[var(--nxt-ink-soft)] py-4 text-center">
                Bookmark problem statements you're still deciding on and they'll show up here.
              </p>
            ) : (
              <div className="space-y-1.5">
                {savedProblems.slice(0, 4).map(p => (
                  <button
                    key={p.id}
                    onClick={onNavigateToProblems}
                    className="w-full text-left bg-[var(--nxt-bg-soft)] hover:bg-[var(--nxt-line)]/40 rounded-xl px-3.5 py-2.5 transition-colors"
                  >
                    <p className="text-xs font-bold text-[var(--nxt-ink)] truncate">{p.title}</p>
                    <p className="text-[11px] text-[var(--nxt-ink-soft)] truncate">{p.department}</p>
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[var(--nxt-ink)]">Team</h2>
            </div>
            {team ? (
              <div>
                <p className="text-xs font-bold text-[var(--nxt-ink)] mb-2">{team.name}</p>
                <div className="space-y-1.5 mb-3">
                  {teamMembers.map(m => (
                    <div key={m.id} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--nxt-mint-strong)] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-xs text-[var(--nxt-ink-soft)] truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={onOpenTeamModal}
                  className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline flex items-center gap-1"
                >
                  Manage team <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-xs text-[var(--nxt-ink-soft)] mb-3">
                  Working solo right now — bring in a co-founder to share applications and roadmap progress.
                </p>
                <PillButton tone="blue" onClick={onOpenTeamModal} className="px-3.5 py-1.5 text-xs mx-auto">
                  <Users2 className="w-3.5 h-3.5" />
                  <span>Invite a Co-Founder</span>
                </PillButton>
              </div>
            )}
          </Reveal>

          <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-lg bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)] shrink-0">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[var(--nxt-ink)]">Founder Slack</p>
                <p className="text-[11px] text-[var(--nxt-ink-soft)] truncate">Talk to peer founders & experts</p>
              </div>
            </div>
            <button
              onClick={onOpenSlackModal}
              className="text-xs font-semibold text-[var(--nxt-mint-strong)] hover:underline shrink-0"
            >
              Join
            </button>
          </Reveal>

          {workingProblems.length > 0 && (
            <Reveal className="bg-[var(--nxt-surface)] border border-[var(--nxt-line)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[var(--nxt-mint-strong)]" />
                <h2 className="text-sm font-bold text-[var(--nxt-ink)]">Working On</h2>
              </div>
              <p className="text-[11px] text-[var(--nxt-ink-soft)] mb-3">
                {workingProblems.length} problem{workingProblems.length === 1 ? '' : 's'} in your roadmap workspace.
              </p>
              <div className="space-y-1.5">
                {workingProblems.slice(0, 3).map(p => (
                  <button
                    key={p.id}
                    onClick={() => onNavigateToRoadmap(p.id)}
                    className="w-full text-left bg-[var(--nxt-bg-soft)] hover:bg-[var(--nxt-line)]/40 rounded-xl px-3.5 py-2 transition-colors"
                  >
                    <p className="text-xs font-bold text-[var(--nxt-ink)] truncate">{p.title}</p>
                  </button>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
};
