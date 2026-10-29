import React from 'react';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { store } from '../../services/store';
import type { AdminTab } from './AdminNav';
import { Button, Card } from './adminUi';

interface Props {
  counts: Partial<Record<AdminTab, number>>;
  onNavigate: (tab: AdminTab) => void;
}

const ATTENTION: { tab: AdminTab; label: (n: number) => string }[] = [
  { tab: 'applications', label: n => `${n} funding application${n === 1 ? '' : 's'} waiting for a decision` },
  { tab: 'submissions', label: n => `${n} piece${n === 1 ? '' : 's'} of step evidence to review` },
  { tab: 'users', label: n => `${n} membership request${n === 1 ? '' : 's'}` },
  { tab: 'inquiries', label: n => `${n} new enquir${n === 1 ? 'y' : 'ies'} from the website` },
  { tab: 'blogs', label: n => `${n} blog draft${n === 1 ? '' : 's'} not yet published` },
];

/** The admin landing page: what needs doing now, and the state of the site at a glance. */
export const AdminOverview: React.FC<Props> = ({ counts, onNavigate }) => {
  const todo = ATTENTION.filter(a => (counts[a.tab] || 0) > 0);
  const users = store.getUsers();
  const votes = store.getVoteBreakdown().reduce((n, v) => n + v.agree + v.disagree, 0);
  const stats: { label: string; value: number; tab: AdminTab }[] = [
    { label: 'Founders', value: users.filter(u => u.role === 'member').length, tab: 'users' },
    { label: 'Problems', value: store.getProblems().length, tab: 'problems' },
    { label: 'Open categories', value: store.getCategories().filter(c => !c.coming_soon).length, tab: 'categories' },
    { label: 'Published posts', value: store.getBlogs().filter(b => b.status === 'published').length, tab: 'blogs' },
    { label: 'Startups promoted', value: store.getStartups().length, tab: 'startups' },
    { label: 'Votes on problems', value: votes, tab: 'analytics' },
  ];

  return (
    <div className="space-y-6">
      <Card title="Needs your attention" hint="Everything waiting on an admin, in one place.">
        {todo.length === 0 ? (
          <p className="flex items-center gap-2 text-[var(--nxt-ink)]"><CheckCircle2 className="w-5 h-5" /> Nothing is waiting. You are all caught up.</p>
        ) : (
          <ul className="divide-y divide-[var(--nxt-line)]">
            {todo.map(a => (
              <li key={a.tab}>
                <button onClick={() => onNavigate(a.tab)} className="w-full flex items-center gap-3 py-3.5 text-left hover:text-[var(--nxt-ink)] group">
                  <AlertCircle className="w-5 h-5 text-[var(--nxt-peach-deep)] shrink-0" />
                  <span className="flex-1 font-semibold">{a.label(counts[a.tab] || 0)}</span>
                  <ArrowRight className="w-4 h-4 text-[var(--nxt-ink-soft)] transition-transform group-hover:translate-x-0.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map(s => (
          <button key={s.label} onClick={() => onNavigate(s.tab)} className="text-left rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] p-5 hover:border-[var(--nxt-ink)] transition-colors">
            <p className="font-display font-bold text-3xl tracking-[-0.03em]">{s.value}</p>
            <p className="mt-1 text-sm text-[var(--nxt-ink-soft)]">{s.label}</p>
          </button>
        ))}
      </div>

      <Card title="Quick actions">
        <div className="flex flex-wrap gap-2.5">
          <Button onClick={() => onNavigate('blogs')}>Write a blog post</Button>
          <Button onClick={() => onNavigate('startups')}>Add a startup</Button>
          <Button onClick={() => onNavigate('problems')}>Add a problem</Button>
          <Button onClick={() => onNavigate('experts')}>Manage experts</Button>
          <Button onClick={() => onNavigate('site')}>Set an announcement</Button>
        </div>
      </Card>
    </div>
  );
};
