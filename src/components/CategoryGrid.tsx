import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { Category } from '../types';
import { store } from '../services/store';
import { categoryIcon } from '../data/icons';

interface Props {
  categories: Category[];
  /** Called when a category that is open is chosen. */
  onPick: (category: Category) => void;
  idPrefix?: string;
}

/** Categories open today first, then the ones coming soon (shown but not clickable). */
export const CategoryGrid: React.FC<Props> = ({ categories, onPick, idPrefix = 'category-card' }) => {
  const open = categories.filter(c => !c.coming_soon);
  const soon = categories.filter(c => c.coming_soon);

  return (
    <div className="space-y-10">
      {open.length > 0 && (
        <section aria-label="Open now">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] mb-4">Open now · {open.length}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {open.map(cat => <Card key={cat.id} cat={cat} idPrefix={idPrefix} onPick={onPick} />)}
          </div>
        </section>
      )}
      {soon.length > 0 && (
        <section aria-label="Coming soon">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] mb-4">Coming soon · {soon.length}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {soon.map(cat => <Card key={cat.id} cat={cat} idPrefix={idPrefix} onPick={onPick} />)}
          </div>
        </section>
      )}
    </div>
  );
};

const Card: React.FC<{ cat: Category; idPrefix: string; onPick: (c: Category) => void }> = ({ cat, idPrefix, onPick }) => {
  const Icon = categoryIcon(cat.id);
  const stepCount = store.getSteps(cat.id).length;
  const soon = !!cat.coming_soon;
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${soon ? 'bg-[var(--nxt-bg-soft)] text-[var(--nxt-ink-soft)]' : 'bg-[var(--nxt-mint)] text-[var(--nxt-mint-strong)]'}`}>
          <Icon className="w-6 h-6" />
        </span>
        {soon && <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-[var(--nxt-line)] text-[var(--nxt-ink-soft)]">Coming soon</span>}
      </div>
      <h3 className="font-display text-lg font-bold text-[var(--nxt-ink)] leading-snug mt-4">{cat.name}</h3>
      <p className="text-[15px] text-[var(--nxt-ink)] mt-1.5 leading-snug">{cat.description}</p>
      {cat.example && <p className="text-sm text-[var(--nxt-ink-soft)] mt-2 leading-snug">e.g. {cat.example}</p>}
      {!soon && (
        <p className="mt-auto pt-5 inline-flex items-center justify-end gap-1 text-xs font-semibold text-[var(--nxt-ink)]">
          {stepCount > 0 ? `${stepCount}-step roadmap` : 'Roadmap'} <ChevronRight className="w-4 h-4" />
        </p>
      )}
    </>
  );
  const base = 'w-full text-left rounded-3xl border p-6 h-full flex flex-col';
  if (soon) {
    return (
      <div id={`${idPrefix}-${cat.id}`} aria-disabled="true" className={`${base} bg-[var(--nxt-surface)]/60 border-dashed border-[var(--nxt-line)] opacity-80`}>
        {inner}
      </div>
    );
  }
  return (
    <motion.button
      id={`${idPrefix}-${cat.id}`}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      onClick={() => onPick(cat)}
      className={`${base} bg-[var(--nxt-surface)] border-[var(--nxt-line)] hover:border-[var(--nxt-mint-strong)]/50 transition-colors`}
    >
      {inner}
    </motion.button>
  );
};
