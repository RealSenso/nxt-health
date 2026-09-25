import React from 'react';
import { SpotKind } from './Illustrations';

interface PageHeaderProps {
  icon: React.ElementType;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Kept for API compatibility; app pages no longer show illustrations. */
  illustration?: SpotKind;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, eyebrow, title, subtitle, actions, children }) => (
  <header className="pb-5 border-b border-[var(--nxt-line)]">
    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
      <div className="flex-1 min-w-0">
        {eyebrow && (
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)] mb-1.5">
            <Icon className="w-3.5 h-3.5" /> {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl sm:text-[1.75rem] font-extrabold text-[var(--nxt-ink)] leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-[var(--nxt-ink-soft)] mt-1.5 max-w-2xl leading-relaxed">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
    {children && <div className="mt-4">{children}</div>}
  </header>
);
export const SegmentedTabs: React.FC<{
  tabs: { id: string; label: string; icon: React.ElementType }[];
  active: string;
  onChange: (id: string) => void;
}> = ({ tabs, active, onChange }) => (
  <div className="inline-flex max-w-full overflow-x-auto no-scrollbar items-center gap-1 p-1 rounded-full bg-[var(--nxt-bg-soft)] border border-[var(--nxt-line)]">
    {tabs.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
          active === id
            ? 'bg-[var(--nxt-surface)] text-[var(--nxt-ink)] shadow-sm'
            : 'text-[var(--nxt-ink-soft)] hover:text-[var(--nxt-ink)]'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    ))}
  </div>
);
