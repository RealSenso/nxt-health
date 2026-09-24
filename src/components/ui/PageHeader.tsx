import React from 'react';
import { Reveal } from './Reveal';
import { SpotIllustration, SpotKind } from './Illustrations';

interface PageHeaderProps {
  icon: React.ElementType;
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  illustration?: SpotKind;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, eyebrow, title, subtitle, illustration, actions, children }) => (
  <Reveal className="nxt-hero-glow relative overflow-hidden rounded-3xl border border-[var(--nxt-line)] shadow-sm">
    <div className="flex items-center gap-6 p-6 sm:p-8">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="w-10 h-10 rounded-2xl bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </span>
          {eyebrow && (
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--nxt-mint-strong)]">{eyebrow}</span>
          )}
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[var(--nxt-ink)] leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-[var(--nxt-ink-soft)] mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
        {actions && <div className="flex flex-wrap items-center gap-2 mt-5">{actions}</div>}
      </div>
      {illustration && <SpotIllustration kind={illustration} className="hidden md:block w-44 lg:w-52 shrink-0" />}
    </div>
    {children && <div className="border-t border-[var(--nxt-line)] px-6 sm:px-8 py-4 bg-[var(--nxt-surface)]/60">{children}</div>}
  </Reveal>
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
