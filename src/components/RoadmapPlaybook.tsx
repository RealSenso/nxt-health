import React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import type { Category } from '../types';

/** A note above a roadmap that was adapted from another category's checklist. */
export const RoadmapNote: React.FC<{ category: Category | null }> = ({ category }) =>
  category?.roadmap_note ? (
    <p className="flex items-start gap-2.5 rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)] px-5 py-4 text-[15px] text-[var(--nxt-ink-soft)]">
      <Info className="w-5 h-5 mt-0.5 shrink-0 text-[var(--nxt-ink)]" /> {category.roadmap_note}
    </p>
  ) : null;

const Panel: React.FC<{ title: string; hint?: string; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, hint, defaultOpen, children }) => (
  <details open={defaultOpen} className="group rounded-3xl border border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-5">
      <span>
        <span className="block font-display text-lg font-bold text-[var(--nxt-ink)]">{title}</span>
        {hint && <span className="block text-sm text-[var(--nxt-ink-soft)] mt-0.5">{hint}</span>}
      </span>
      <ChevronDown className="w-5 h-5 shrink-0 text-[var(--nxt-ink-soft)] transition-transform group-open:rotate-180" />
    </summary>
    <div className="px-6 pb-6">{children}</div>
  </details>
);

const Table: React.FC<{ head: string[]; rows: string[][] }> = ({ head, rows }) => (
  <div className="overflow-x-auto -mx-2 px-2">
    <table className="w-full text-left text-[15px] min-w-[34rem]">
      <thead>
        <tr className="border-b border-[var(--nxt-ink)] text-xs uppercase tracking-wider text-[var(--nxt-ink-soft)]">
          {head.map(h => <th key={h} className="py-2 pr-4 font-semibold">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-[var(--nxt-line)] align-top">
            {row.map((cell, j) => <td key={j} className={`py-3 pr-4 ${j === 0 ? 'font-semibold text-[var(--nxt-ink)]' : 'text-[var(--nxt-ink-soft)]'}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** The business-model questions, cost inputs and how-to-use notes that go with a category's roadmap. */
export const RoadmapPlaybook: React.FC<{ category: Category | null }> = ({ category }) => {
  const playbook = category?.playbook;
  if (!playbook) return null;
  return (
    <section className="space-y-4" aria-label="Playbook">
      <h2 className="font-display text-2xl font-bold text-[var(--nxt-ink)] tracking-tight">Playbook</h2>
      {playbook.how_to_use.length > 0 && (
        <Panel title="How to use this roadmap" defaultOpen>
          <ol className="space-y-2.5 list-none">
            {playbook.how_to_use.map((tip, i) => (
              <li key={tip} className="flex gap-3 text-[15px] text-[var(--nxt-ink)]">
                <span className="w-6 h-6 rounded-full border border-[var(--nxt-ink)] text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="pt-0.5">{tip}</span>
              </li>
            ))}
          </ol>
        </Panel>
      )}
      {playbook.model.length > 0 && (
        <Panel title="Business model" hint="The questions to answer before detailed execution, and what each one should produce.">
          <Table head={['Component', 'Key question', 'Output']} rows={playbook.model.map(m => [m.component, m.question, m.output])} />
        </Panel>
      )}
      {playbook.cost_inputs.length > 0 && (
        <Panel title="What will it cost to build?" hint="Inputs to start a funding estimate for your startup.">
          <Table head={['Cost', 'Input', 'Why it matters', 'How to plan it']} rows={playbook.cost_inputs.map(c => [c.category, c.input, c.why, c.approach])} />
        </Panel>
      )}
    </section>
  );
};
