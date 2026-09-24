import React, { useState } from 'react';
import {
  Filter, Activity, Users, Route, BookMarked, ShieldCheck, TrendingDown, AlertTriangle, Clock, Star,
  Trophy, Megaphone, UserCheck, Hourglass, MessageSquare,
} from 'lucide-react';
import { store } from '../../services/store';
import { getStepGuide } from '../../data/stepGuides';
import { BACKGROUND_OPTIONS, COMMITMENT_OPTIONS, SOURCE_OPTIONS, STAGE_OPTIONS, labelFor } from '../../data/profileOptions';
import { HBarList, HeatCell, StatTile } from '../ui/Charts';
import { SegmentedTabs } from '../ui/PageHeader';
import { User } from '../../types';

const DAY = 86_400_000;
const daysSince = (iso?: string) => (iso ? (Date.now() - new Date(iso).getTime()) / DAY : Infinity);
const daysBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / DAY;
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const fmtDays = (d: number | null) => (d === null ? '—' : d < 1 ? '<1 day' : `${Math.round(d)} day${Math.round(d) === 1 ? '' : 's'}`);
const fmtMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${Math.round(n / 1_000)}k` : `$${n}`;
const firstName = (u?: User) => u?.name.split(' (')[0] || 'Unknown';

const Panel: React.FC<{ title: string; hint?: string; icon?: React.ElementType; children: React.ReactNode; className?: string }> = ({
  title, hint, icon: Icon, children, className = '',
}) => (
  <section className={`rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5 sm:p-6 shadow-sm ${className}`}>
    <h3 className="font-display text-base font-bold text-[var(--nxt-ink)] flex items-center gap-2">
      {Icon && <Icon className="w-4.5 h-4.5 text-[var(--nxt-mint-strong)]" />} {title}
    </h3>
    {hint && <p className="text-sm text-[var(--nxt-ink-soft)] mt-1">{hint}</p>}
    <div className="mt-4">{children}</div>
  </section>
);

const Table: React.FC<{ head: string[]; children: React.ReactNode }> = ({ head, children }) => (
  <div className="overflow-x-auto -mx-1">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-[var(--nxt-ink-soft)]">
          {head.map((h, i) => <th key={h} className={`pb-2 px-1 font-semibold ${i > 0 ? 'text-right' : ''}`}>{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-[var(--nxt-line)]">{children}</tbody>
    </table>
  </div>
);

type Tab = 'growth' | 'founders' | 'roadmaps' | 'quality';

export const BusinessAnalytics: React.FC = () => {
  const [tab, setTab] = useState<Tab>('growth');

  const users = store.getUsers();
  const founders = users.filter(u => u.role === 'member');
  const scopeOf = (u: User) => store.getScopeKey(u);
  const workingProblems = store.getAllWorkingProblems();
  const locks = store.getAllCategoryLocks();
  const workspaces = store.getAllStepWorkspaces();
  const progress = store.getAllProgress().filter(p => p.completed);
  const applications = store.getApplications().filter(a => a.status !== 'Draft');
  const submissions = store.getAllStepSubmissions();
  const views = store.getResourceViews();
  const ratings = store.getStepRatings();
  const allSteps = store.getSteps();
  const categories = store.getCategories();
  const resources = store.getResources();

  const workspaceEntries = Object.entries(workspaces).map(([key, ws]) => {
    const [scope, problemId, stepId] = key.split('::');
    return { scope, problemId, stepId, ws };
  });
  const completedAt = (scope: string, stepId: string) => progress.find(p => p.user_id === scope && p.step_id === stepId)?.updated_at;

  // 2. Funnel
  const members = founders.filter(u => u.is_member);
  const started = founders.filter(u => (workingProblems[scopeOf(u)] || []).length > 0);
  const committed = founders.filter(u => Object.keys(locks[scopeOf(u)] || {}).length > 0);
  const applied = founders.filter(u => applications.some(a => a.user_id === u.id));
  const funded = founders.filter(u => applications.some(a => a.user_id === u.id && a.status === 'Approved'));
  const funnel = [
    { label: 'Signed up', users: founders },
    { label: 'Became a member', users: members },
    { label: 'Started a project', users: started },
    { label: 'Committed to a category', users: committed },
    { label: 'Applied for funding', users: applied },
    { label: 'Received funding', users: funded },
  ];
  const signupToMember = median(members.filter(u => u.created_at && u.membership_started_at).map(u => daysBetween(u.created_at!, u.membership_started_at!)));
  const memberToFirstStep = median(members.flatMap(u => {
    const starts = workspaceEntries.filter(w => w.scope === scopeOf(u) && w.ws.started_at).map(w => w.ws.started_at!);
    if (!u.membership_started_at || !starts.length) return [];
    return [Math.max(0, daysBetween(u.membership_started_at, starts.sort()[0]))];
  }));
  const signupToApplication = median(applied.flatMap(u => {
    const first = applications.filter(a => a.user_id === u.id).map(a => a.submitted_at).sort()[0];
    return u.created_at && first ? [Math.max(0, daysBetween(u.created_at, first))] : [];
  }));

  // 3. Engagement & retention
  const wau = founders.filter(u => daysSince(u.last_active_at) <= 7).length;
  const mau = founders.filter(u => daysSince(u.last_active_at) <= 30).length;
  const dormant = founders.filter(u => daysSince(u.last_active_at) > 30).sort((a, b) => daysSince(b.last_active_at) - daysSince(a.last_active_at));
  const retentionAt = (days: number) => {
    const eligible = founders.filter(u => daysSince(u.created_at) >= days);
    const retained = eligible.filter(u => u.created_at && u.last_active_at && daysBetween(u.created_at, u.last_active_at) >= days);
    return eligible.length ? pct(retained.length, eligible.length) : null;
  };
  const cohorts = (() => {
    const byMonth = new Map<string, User[]>();
    founders.filter(u => u.created_at).forEach(u => {
      const d = new Date(u.created_at!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.set(key, [...(byMonth.get(key) || []), u]);
    });
    return Array.from(byMonth.entries()).sort((a, b) => b[0].localeCompare(a[0])).map(([key, cohortUsers]) => {
      const cell = (days: number) => {
        const eligible = cohortUsers.filter(u => daysSince(u.created_at) >= days);
        if (!eligible.length) return null;
        return pct(eligible.filter(u => u.last_active_at && daysBetween(u.created_at!, u.last_active_at) >= days).length, eligible.length);
      };
      const [y, m] = key.split('-').map(Number);
      return {
        label: new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        size: cohortUsers.length,
        d30: cell(30), d60: cell(60), d90: cell(90),
      };
    });
  })();

  // 4 & 5. Founder profile
  const distribution = <T extends string>(options: { value: T; label: string }[], pick: (u: User) => T | undefined) =>
    [...options.map(o => ({ label: o.label.split(' (')[0], value: founders.filter(u => pick(u) === o.value).length })),
      { label: 'Not provided', value: founders.filter(u => !pick(u)).length }]
      .filter(d => d.value > 0)
      .map(d => ({ ...d, display: `${d.value} · ${pct(d.value, founders.length)}%`, detail: `${d.value} of ${founders.length} founders` }));
  const answeredFirstTime = founders.filter(u => u.first_time_founder !== undefined);
  const answeredRevenue = founders.filter(u => u.has_revenue !== undefined);
  const totalRaised = founders.reduce((s, u) => s + (u.funding_raised_total || 0), 0);
  const teamSizes = (() => {
    const solo = founders.filter(u => !u.team_id).length;
    const teams = store.getTeams();
    return [
      { label: 'Solo founder', value: solo },
      { label: 'Team of 2', value: teams.filter(t => t.member_ids.length === 2).length },
      { label: 'Team of 3+', value: teams.filter(t => t.member_ids.length >= 3).length },
    ];
  })();

  // 7. Acquisition channels
  const channelRows = [...SOURCE_OPTIONS.map(o => ({ value: o.value as string | undefined, label: o.label })), { value: undefined, label: 'Not provided' }]
    .map(ch => {
      const group = founders.filter(u => u.acquisition_source === ch.value);
      const stepsDone = group.map(u => progress.filter(p => p.user_id === scopeOf(u)).length);
      return {
        label: ch.label,
        signups: group.length,
        memberRate: pct(group.filter(u => u.is_member).length, group.length),
        avgSteps: stepsDone.length ? (stepsDone.reduce((a, b) => a + b, 0) / stepsDone.length).toFixed(1) : '—',
      };
    })
    .filter(r => r.signups > 0)
    .sort((a, b) => b.signups - a.signups);

  // 1. Roadmap health / drop-off
  const stepRows = allSteps
    .map(step => {
      const entries = workspaceEntries.filter(w => w.stepId === step.id && w.ws.started_at);
      const completed = entries.filter(w => completedAt(w.scope, step.id));
      const blocked = entries.filter(w => w.ws.status === 'blocked' && !completedAt(w.scope, step.id));
      const durations = completed.map(w => daysBetween(w.ws.started_at!, completedAt(w.scope, step.id)!));
      const openDurations = entries.filter(w => !completedAt(w.scope, step.id)).map(w => daysSince(w.ws.started_at));
      return {
        step,
        category: categories.find(c => c.id === step.category_id),
        started: entries.length,
        completed: completed.length,
        blocked: blocked.length,
        medianDone: median(durations),
        medianOpen: median(openDurations),
        typical: getStepGuide(step.stage_tag).typicalDuration,
      };
    })
    .filter(r => r.started > 0);
  const blockers = workspaceEntries
    .filter(w => w.ws.status === 'blocked' && !completedAt(w.scope, w.stepId))
    .map(w => ({
      who: users.find(u => u.id === w.scope)?.name.split(' (')[0] || store.getTeam(w.scope)?.name || w.scope,
      step: allSteps.find(st => st.id === w.stepId)?.name || w.stepId,
      reason: w.ws.blocker || 'No reason given',
      days: Math.round(daysSince(w.ws.updated_at)),
    }))
    .sort((a, b) => b.days - a.days);
  const stalled = workspaceEntries.filter(w => w.ws.status === 'in_progress' && !completedAt(w.scope, w.stepId) && daysSince(w.ws.updated_at) > 30).length;
  const furthestStep = (() => {
    const counts = new Map<string, number>();
    Object.entries(locks).forEach(([scope, byProblem]) => {
      Object.values(byProblem).forEach(catId => {
        const catSteps = store.getSteps(catId);
        const done = catSteps.filter(st => completedAt(scope, st.id)).length;
        const where = done === catSteps.length && catSteps.length ? 'Finished roadmap' : catSteps[done] ? `Step ${catSteps[done].order}` : 'No steps yet';
        counts.set(where, (counts.get(where) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
      .map(([label, value]) => ({ label: label === 'Finished roadmap' || label === 'No steps yet' ? label : `Currently on ${label}`, value }));
  })();

  // 6. Outcomes
  const reporters = founders.filter(u => u.outcomes);
  const recentReporters = reporters.filter(u => daysSince(u.outcomes!.updated_at) <= 90);
  const pilots = reporters.reduce((s, u) => s + u.outcomes!.pilots_signed, 0);
  const filings = reporters.reduce((s, u) => s + u.outcomes!.regulatory_filings, 0);
  const raisedSince = reporters.reduce((s, u) => s + u.outcomes!.funding_raised_since_joining, 0);

  // 8. Resource impact
  const topResources = resources
    .map(r => {
      const rv = views.filter(v => v.resource_id === r.id);
      const viewers = new Set(rv.map(v => v.user_id)).size;
      return { label: r.title, value: viewers, display: `${viewers} founder${viewers === 1 ? '' : 's'}`, detail: `${rv.length} total opens` };
    })
    .filter(r => r.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const resourceImpact = (() => {
    let viewedStarted = 0, viewedDone = 0, notStarted = 0, notDone = 0;
    workspaceEntries.filter(w => w.ws.started_at).forEach(w => {
      const stepResourceIds = new Set(resources.filter(r => r.step_id === w.stepId).map(r => r.id));
      if (!stepResourceIds.size) return;
      const scopeUserIds = users.filter(u => scopeOf(u) === w.scope).map(u => u.id);
      const viewed = views.some(v => scopeUserIds.includes(v.user_id) && stepResourceIds.has(v.resource_id));
      const done = !!completedAt(w.scope, w.stepId);
      if (viewed) { viewedStarted++; if (done) viewedDone++; } else { notStarted++; if (done) notDone++; }
    });
    return { viewed: viewedStarted ? pct(viewedDone, viewedStarted) : null, notViewed: notStarted ? pct(notDone, notStarted) : null, viewedStarted, notStarted };
  })();

  // 9. Quality
  const reviewed = submissions.filter(s => s.reviewed_at);
  const reviewTurnaround = median(reviewed.map(s => daysBetween(s.submitted_at, s.reviewed_at!)));
  const firstAttempts = (() => {
    const firsts = new Map<string, typeof submissions[number]>();
    [...submissions].sort((a, b) => a.submitted_at.localeCompare(b.submitted_at)).forEach(s => {
      const key = `${s.user_id}:${s.step_id}`;
      if (!firsts.has(key)) firsts.set(key, s);
    });
    return Array.from(firsts.values()).filter(s => s.status !== 'Submitted');
  })();
  const firstTimeApproval = firstAttempts.length ? pct(firstAttempts.filter(s => s.status === 'Approved').length, firstAttempts.length) : null;
  const promoters = ratings.filter(r => r.score >= 9).length;
  const detractors = ratings.filter(r => r.score <= 6).length;
  const nps = ratings.length ? pct(promoters, ratings.length) - pct(detractors, ratings.length) : null;
  const stepScores = allSteps
    .map(step => {
      const rs = ratings.filter(r => r.step_id === step.id);
      return { step, count: rs.length, avg: rs.length ? rs.reduce((s, r) => s + r.score, 0) / rs.length : 0 };
    })
    .filter(s => s.count > 0)
    .sort((a, b) => a.avg - b.avg);
  const comments = ratings.filter(r => r.comment).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto no-scrollbar">
        <SegmentedTabs
          tabs={[
            { id: 'growth', label: 'Funnel & retention', icon: Filter },
            { id: 'founders', label: 'Founders', icon: Users },
            { id: 'roadmaps', label: 'Roadmap health', icon: Route },
            { id: 'quality', label: 'Resources & quality', icon: ShieldCheck },
          ]}
          active={tab}
          onChange={(id) => setTab(id as Tab)}
        />
      </div>

      {tab === 'growth' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile icon={Activity} label="Weekly active founders" value={wau} sub={`of ${founders.length} total`} />
            <StatTile icon={Activity} label="Monthly active founders" value={mau} sub={`${pct(wau, mau)}% come back weekly`} />
            <StatTile icon={UserCheck} label="Signup → member" value={`${pct(members.length, founders.length)}%`} sub={`median ${fmtDays(signupToMember)} to convert`} />
            <StatTile icon={Hourglass} label="Member → first step" value={fmtDays(memberToFirstStep)} sub={`signup → first application: ${fmtDays(signupToApplication)}`} />
          </div>

          <Panel icon={Filter} title="Conversion funnel" hint="Share of all signed-up founders reaching each stage. Hover a bar for the step-to-step conversion.">
            <HBarList
              max={founders.length}
              data={funnel.map((stage, i) => ({
                label: stage.label,
                value: stage.users.length,
                display: `${stage.users.length} · ${pct(stage.users.length, founders.length)}%`,
                detail: i === 0 ? `${stage.users.length} founders signed up` : `${pct(stage.users.length, funnel[i - 1].users.length)}% of "${funnel[i - 1].label}"`,
              }))}
            />
          </Panel>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel icon={TrendingDown} title="Retention by signup cohort" hint="Share of each month's signups still active 30, 60 and 90 days after joining. — means the cohort is too young to measure.">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-[var(--nxt-ink-soft)]">
                      <th className="text-left font-semibold pb-2">Cohort</th>
                      <th className="font-semibold pb-2">Size</th>
                      <th className="font-semibold pb-2">Day 30</th>
                      <th className="font-semibold pb-2">Day 60</th>
                      <th className="font-semibold pb-2">Day 90</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map(c => (
                      <tr key={c.label}>
                        <td className="pr-2 text-[var(--nxt-ink)] whitespace-nowrap">{c.label}</td>
                        <td className="text-center text-[var(--nxt-ink-soft)] tabular-nums">{c.size}</td>
                        <HeatCell pct={c.d30} />
                        <HeatCell pct={c.d60} />
                        <HeatCell pct={c.d90} />
                      </tr>
                    ))}
                    <tr className="border-t border-[var(--nxt-line)]">
                      <td className="pr-2 pt-2 font-semibold text-[var(--nxt-ink)]">All founders</td>
                      <td className="text-center pt-2 text-[var(--nxt-ink-soft)] tabular-nums">{founders.length}</td>
                      <HeatCell pct={retentionAt(30)} />
                      <HeatCell pct={retentionAt(60)} />
                      <HeatCell pct={retentionAt(90)} />
                    </tr>
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel icon={Clock} title="Gone quiet" hint="Founders with no activity in 30+ days — good candidates for a check-in email.">
              {dormant.length === 0 ? (
                <p className="text-sm text-[var(--nxt-ink-soft)]">Everyone has been active in the last 30 days.</p>
              ) : (
                <Table head={['Founder', 'Member?', 'Last active']}>
                  {dormant.map(u => (
                    <tr key={u.id}>
                      <td className="py-2 px-1 text-[var(--nxt-ink)]">{firstName(u)}</td>
                      <td className="py-2 px-1 text-right text-[var(--nxt-ink-soft)]">{u.is_member ? 'Yes' : 'No'}</td>
                      <td className="py-2 px-1 text-right tabular-nums text-[var(--nxt-ink)]">
                        {Number.isFinite(daysSince(u.last_active_at)) ? `${Math.round(daysSince(u.last_active_at))} days ago` : 'Never'}
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </Panel>
          </div>

          <Panel icon={Megaphone} title="Acquisition channels" hint="Where founders heard about us, and how well each channel converts and progresses.">
            <Table head={['Channel', 'Signups', 'Became members', 'Avg. steps completed']}>
              {channelRows.map(r => (
                <tr key={r.label}>
                  <td className="py-2 px-1 text-[var(--nxt-ink)]">{r.label}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{r.signups}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{r.memberRate}%</td>
                  <td className="py-2 px-1 text-right tabular-nums">{r.avgSteps}</td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}

      {tab === 'founders' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile icon={Users} label="First-time founders" value={`${pct(answeredFirstTime.filter(u => u.first_time_founder).length, answeredFirstTime.length)}%`} sub={`${answeredFirstTime.length} of ${founders.length} answered`} />
            <StatTile icon={Clock} label="Working full-time" value={`${pct(founders.filter(u => u.commitment === 'full_time').length, founders.filter(u => u.commitment).length)}%`} sub={`${founders.filter(u => u.commitment).length} answered`} />
            <StatTile icon={Trophy} label="Total raised (all time)" value={fmtMoney(totalRaised)} sub={`${pct(answeredRevenue.filter(u => u.has_revenue).length, answeredRevenue.length)}% have revenue`} />
            <StatTile icon={Trophy} label="Outcomes since joining" value={`${pilots} pilots`} sub={`${filings} regulatory filings · ${fmtMoney(raisedSince)} raised`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel title="Background" hint="Self-reported at signup or in the founder profile.">
              <HBarList data={distribution(BACKGROUND_OPTIONS, u => u.background)} />
            </Panel>
            <Panel title="Startup stage">
              <HBarList data={distribution(STAGE_OPTIONS, u => u.startup_stage)} />
            </Panel>
            <Panel title="Commitment">
              <HBarList data={distribution(COMMITMENT_OPTIONS, u => u.commitment)} />
            </Panel>
            <Panel title="Team size">
              <HBarList data={teamSizes.filter(t => t.value > 0)} />
            </Panel>
          </div>

          <Panel icon={Trophy} title="Founder outcomes" hint={`${reporters.length} founders have reported outcomes; ${recentReporters.length} in the last 90 days. The dashboard nudges members every quarter.`}>
            <Table head={['Founder', 'Stage', 'Pilots', 'Filings', 'Raised since joining', 'Updated']}>
              {reporters.map(u => (
                <tr key={u.id}>
                  <td className="py-2 px-1 text-[var(--nxt-ink)]">{firstName(u)}</td>
                  <td className="py-2 px-1 text-right text-[var(--nxt-ink-soft)]">{labelFor(STAGE_OPTIONS, u.startup_stage)}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{u.outcomes!.pilots_signed}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{u.outcomes!.regulatory_filings}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{fmtMoney(u.outcomes!.funding_raised_since_joining)}</td>
                  <td className="py-2 px-1 text-right text-[var(--nxt-ink-soft)] tabular-nums">{Math.round(daysSince(u.outcomes!.updated_at))}d ago</td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}

      {tab === 'roadmaps' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile icon={Route} label="Projects with a category" value={Object.values(locks).reduce((s, l) => s + Object.keys(l).length, 0)} />
            <StatTile icon={AlertTriangle} label="Blocked steps" value={blockers.length} sub="self-reported by founders" />
            <StatTile icon={Clock} label="Stalled steps" value={stalled} sub="in progress, untouched 30+ days" />
            <StatTile icon={Star} label="Steps completed" value={progress.length} sub="across all founders" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel icon={TrendingDown} title="Where founders are now" hint="The next unfinished step for each project that has committed to a category.">
              <HBarList data={furthestStep} />
            </Panel>

            <Panel icon={AlertTriangle} title="Blockers" hint="What founders say is holding them up. Recurring reasons point to partnerships worth building.">
              {blockers.length === 0 ? (
                <p className="text-sm text-[var(--nxt-ink-soft)]">No blocked steps right now.</p>
              ) : (
                <ul className="space-y-3">
                  {blockers.map((b, i) => (
                    <li key={i} className="rounded-2xl bg-[var(--nxt-bg-soft)] p-3">
                      <p className="text-sm font-semibold text-[var(--nxt-ink)]">{b.reason}</p>
                      <p className="text-xs text-[var(--nxt-ink-soft)] mt-0.5">{b.who} · {b.step} · blocked {b.days} days</p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel icon={Hourglass} title="Time on each step" hint="Median days for founders who finished the step, and how long open steps have been running, against our typical estimate.">
            <Table head={['Step', 'Started', 'Completed', 'Blocked', 'Median to finish', 'Median open', 'Typical']}>
              {stepRows.map(r => (
                <tr key={r.step.id}>
                  <td className="py-2 px-1">
                    <p className="text-[var(--nxt-ink)]">{r.step.name}</p>
                    <p className="text-xs text-[var(--nxt-ink-soft)]">{r.category?.name} · Step {r.step.order}</p>
                  </td>
                  <td className="py-2 px-1 text-right tabular-nums">{r.started}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{r.completed} <span className="text-xs text-[var(--nxt-ink-soft)]">({pct(r.completed, r.started)}%)</span></td>
                  <td className="py-2 px-1 text-right tabular-nums">{r.blocked}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{fmtDays(r.medianDone)}</td>
                  <td className="py-2 px-1 text-right tabular-nums">{fmtDays(r.medianOpen)}</td>
                  <td className="py-2 px-1 text-right text-[var(--nxt-ink-soft)] whitespace-nowrap">{r.typical}</td>
                </tr>
              ))}
            </Table>
          </Panel>
        </>
      )}

      {tab === 'quality' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile icon={Star} label="Step NPS" value={nps === null ? '—' : nps > 0 ? `+${nps}` : nps} sub={`${ratings.length} ratings · ${promoters} promoters, ${detractors} detractors`} />
            <StatTile icon={Clock} label="Evidence review time" value={fmtDays(reviewTurnaround)} sub={`median across ${reviewed.length} reviews`} />
            <StatTile icon={ShieldCheck} label="Approved first time" value={firstTimeApproval === null ? '—' : `${firstTimeApproval}%`} sub="of first evidence submissions" />
            <StatTile icon={Clock} label="Awaiting review" value={submissions.filter(s => s.status === 'Submitted').length} sub="evidence submissions" />
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel icon={BookMarked} title="Most-used resources" hint="Unique founders who opened each resource. Hover for total opens.">
              <HBarList data={topResources} emptyText="No resource opens tracked yet." />
            </Panel>

            <Panel icon={BookMarked} title="Do resources help?" hint="Completion rate of started steps, split by whether the founder opened any of that step's resources.">
              <HBarList
                max={100}
                data={[
                  { label: 'Opened a resource for the step', value: resourceImpact.viewed ?? 0, display: resourceImpact.viewed === null ? '—' : `${resourceImpact.viewed}% completed`, detail: `${resourceImpact.viewedStarted} started steps` },
                  { label: "Didn't open any", value: resourceImpact.notViewed ?? 0, display: resourceImpact.notViewed === null ? '—' : `${resourceImpact.notViewed}% completed`, detail: `${resourceImpact.notStarted} started steps` },
                ]}
              />
              <p className="text-xs text-[var(--nxt-ink-soft)] mt-4">Small samples — treat as a signal, not proof.</p>
            </Panel>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel icon={Star} title="Lowest-rated steps" hint="Average 0–10 rating after completion. Start improving guidance here.">
              <HBarList
                max={10}
                data={stepScores.map(s => ({ label: s.step.name, value: s.avg, display: `${s.avg.toFixed(1)} / 10`, detail: `${s.count} rating${s.count === 1 ? '' : 's'}` }))}
                emptyText="No step ratings yet."
              />
            </Panel>
            <Panel icon={MessageSquare} title="Recent feedback">
              {comments.length === 0 ? (
                <p className="text-sm text-[var(--nxt-ink-soft)]">No written feedback yet.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c, i) => (
                    <li key={i} className="rounded-2xl bg-[var(--nxt-bg-soft)] p-3">
                      <p className="text-sm text-[var(--nxt-ink)]">"{c.comment}"</p>
                      <p className="text-xs text-[var(--nxt-ink-soft)] mt-1">
                        {firstName(users.find(u => u.id === c.user_id))} · {allSteps.find(s => s.id === c.step_id)?.name} · scored {c.score}/10
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};
