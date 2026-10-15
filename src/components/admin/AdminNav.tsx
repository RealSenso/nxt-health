import React, { useMemo, useState } from 'react';
import {
  BarChart3, BookOpen, FileText, FolderPlus, Globe, Hospital, Inbox, LayoutDashboard, Layers, ListFilter, Megaphone, Paperclip, Search, Users, UserCheck,
} from 'lucide-react';

export type AdminTab =
  | 'overview' | 'applications' | 'submissions' | 'users' | 'inquiries'
  | 'problems' | 'categories' | 'steps' | 'resources' | 'blogs' | 'startups'
  | 'experts' | 'analytics' | 'site';

export interface AdminSection { id: AdminTab; label: string; icon: React.ElementType; keywords: string; group: string }

export const ADMIN_SECTIONS: AdminSection[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, keywords: 'home dashboard summary attention', group: '' },
  { id: 'applications', label: 'Funding queue', icon: FileText, keywords: 'grants applications review approve', group: 'Review' },
  { id: 'submissions', label: 'Step evidence', icon: Paperclip, keywords: 'submissions evidence files review', group: 'Review' },
  { id: 'users', label: 'Members', icon: Users, keywords: 'users founders membership admins experts mentors', group: 'Review' },
  { id: 'inquiries', label: 'Enquiries', icon: Inbox, keywords: 'leads contact forms sponsors', group: 'Review' },
  { id: 'problems', label: 'Problem statements', icon: ListFilter, keywords: 'problems statements posters votes', group: 'Content' },
  { id: 'categories', label: 'Categories', icon: FolderPlus, keywords: 'categories roadmaps coming soon', group: 'Content' },
  { id: 'steps', label: 'Steps and roadmaps', icon: Layers, keywords: 'steps tasks roadmap cost', group: 'Content' },
  { id: 'resources', label: 'Resources and hospital hub', icon: Hospital, keywords: 'resources webinars sessions hospital events', group: 'Content' },
  { id: 'blogs', label: 'Blog', icon: BookOpen, keywords: 'blog posts articles write publish', group: 'Content' },
  { id: 'startups', label: 'Startups', icon: Megaphone, keywords: 'startups promote companies home', group: 'Content' },
  { id: 'experts', label: 'Experts', icon: UserCheck, keywords: 'experts profiles webinars podcasts videos pipeline', group: 'People' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, keywords: 'analytics costs votes funnel retention', group: 'Insights' },
  { id: 'site', label: 'Website settings', icon: Globe, keywords: 'site announcement banner homepage headline', group: 'Website' },
];

interface Props {
  active: AdminTab;
  counts: Partial<Record<AdminTab, number>>;
  onSelect: (tab: AdminTab) => void;
}

/** Grouped navigation for the admin console, with a filter and a count on the sections that need attention. */
export const AdminNav: React.FC<Props> = ({ active, counts, onSelect }) => {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const sections = useMemo(
    () => ADMIN_SECTIONS.filter(s => !q || `${s.label} ${s.keywords}`.toLowerCase().includes(q)),
    [q],
  );
  const groups = Array.from(new Set(sections.map(s => s.group)));

  return (
    <nav aria-label="Admin sections" className="lg:sticky lg:top-24 space-y-4">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--nxt-ink-soft)]" />
        <input
          id="input-admin-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a section"
          className="w-full rounded-xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)] pl-9 pr-3 py-2 text-sm"
          aria-label="Find an admin section"
        />
      </div>

      <div className="flex gap-4 overflow-x-auto lg:block lg:overflow-visible lg:space-y-5 pb-1 no-scrollbar">
        {groups.map(group => (
          <div key={group || 'top'} className="shrink-0 lg:shrink">
            {group && <p className="hidden lg:block px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-[var(--nxt-ink-soft)]">{group}</p>}
            <ul className="flex lg:block gap-1.5">
              {sections.filter(s => s.group === group).map(section => {
                const isActive = active === section.id;
                const count = counts[section.id];
                return (
                  <li key={section.id}>
                    <button
                      id={`admin-section-${section.id}`}
                      onClick={() => onSelect(section.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full whitespace-nowrap flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-[var(--nxt-ink-fixed)] text-white font-semibold' : 'text-[var(--nxt-ink-soft)] hover:bg-[var(--nxt-bg-soft)] hover:text-[var(--nxt-ink)]'
                      }`}
                    >
                      <section.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{section.label}</span>
                      {!!count && (
                        <span className={`text-[11px] font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center ${isActive ? 'bg-white/20' : 'bg-[var(--nxt-peach)] text-[var(--nxt-peach-deep)]'}`}>{count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {sections.length === 0 && <p className="text-sm text-[var(--nxt-ink-soft)] px-3">No section matches that.</p>}
      </div>
    </nav>
  );
};
