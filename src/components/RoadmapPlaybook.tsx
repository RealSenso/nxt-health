import React from 'react';
import { ChevronDown, Info } from 'lucide-react';
import type { Category } from '../types';

/** A note above a roadmap that was adapted from another category's checklist. */
/** The experts who made a roadmap, shown above it. Keyed by category so it never depends on stored data. */
const CREDITS: Record<string, {
  name: string; initials: string; title: string; headline: string; where: string; company: string; years: string;
  credentials: string[]; focus: string[]; recognition: string; made: string; linkedin: string;
}> = {
  'cat-samd': {
    name: 'Dr Arjun L Balaji',
    initials: 'AB',
    title: 'Global Senior Clinical Expert',
    headline: 'Physician leader: clinical and product strategy for AI-enabled MedTech',
    where: 'Bengaluru, India',
    company: 'Olympus Medical Systems India',
    years: '15+',
    credentials: ['MBBS', 'MPH', 'Stanford LEAD', 'IISc: Digital Health & Imaging'],
    focus: ['AI-enabled MedTech', 'Regulatory affairs', 'Clinical strategy', 'Digital health', 'Radiology', 'Gastroenterology'],
    recognition: 'Multiple Siemens Healthineers excellence awards, 2018 to 2022',
    made: 'This roadmap is his. The order of the phases, the advice on choosing a clinician panel, the evidence and documentation approach and the “get to 80%, then defend” principle all come from his working session with us.',
    linkedin: 'https://www.linkedin.com/in/arjunlb/',
  },
};

export const ExpertCredit: React.FC<{ category: Category | null }> = ({ category }) => {
  const c = category ? CREDITS[category.id] : undefined;
  if (!c) return null;
  return (
    <section data-no-motion className="relative overflow-hidden rounded-3xl border border-[var(--nxt-green)]/40 bg-[var(--nxt-surface)] p-6 sm:p-8">
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 800 220">
        <path className="nxt-flow" d="M-10 190 C 160 190 200 80 380 90 S 620 170 810 40" fill="none" stroke="var(--nxt-green)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <circle r="3.5" fill="var(--nxt-green)"><animateMotion dur="8s" repeatCount="indefinite" path="M-10 190 C 160 190 200 80 380 90 S 620 170 810 40" /></circle>
      </svg>
      <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8">
        <span className="relative shrink-0 w-24 h-24 rounded-full border border-[var(--nxt-green)] text-[var(--nxt-green)] flex items-center justify-center font-display font-light text-3xl shadow-[0_0_36px_-6px_var(--nxt-green)]">
          <span className="absolute inset-0 rounded-full border border-[var(--nxt-green)] animate-ping opacity-30" />
          {c.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--nxt-green)]">Made with</p>
          <h2 className="mt-2 font-display font-light text-[clamp(1.7rem,3vw,2.4rem)] leading-tight tracking-[-0.01em]">{c.name}</h2>
          <p className="mt-1 text-[var(--nxt-ink-soft)]">{c.title}. {c.headline}.</p>
          <p className="mt-4 max-w-2xl text-[16px] font-light leading-relaxed">{c.made}</p>

          <dl className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-5">
            {[['Experience', `${c.years} years`], ['Based in', c.where], ['At', c.company], ['Recognised', c.recognition]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-[var(--nxt-ink-soft)]">{k}</dt>
                <dd className="mt-1 text-[15px] font-light leading-snug">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {c.credentials.map(x => <span key={x} className="rounded-full bg-[var(--nxt-green)] text-[var(--nxt-green-ink)] px-3.5 py-1.5 text-xs">{x}</span>)}
            {c.focus.map(x => <span key={x} className="rounded-full border border-[var(--nxt-line)] px-3.5 py-1.5 text-xs text-[var(--nxt-ink-soft)]">{x}</span>)}
          </div>
          <a href={c.linkedin} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--nxt-line)] px-5 py-2.5 text-sm hover:border-[var(--nxt-green)] hover:text-[var(--nxt-green)] transition-colors">
            View LinkedIn profile
          </a>
        </div>
      </div>
    </section>
  );
};

/** A note above a roadmap that was adapted from another category's checklist, and the credit for whoever made it. */
export const RoadmapNote: React.FC<{ category: Category | null }> = ({ category }) => (
  <>
    <ExpertCredit category={category} />
    {category?.roadmap_note && (
      <p className="flex items-start gap-2.5 rounded-2xl border border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)] px-5 py-4 text-[15px] text-[var(--nxt-ink-soft)]">
        <Info className="w-5 h-5 mt-0.5 shrink-0 text-[var(--nxt-ink)]" /> {category.roadmap_note}
      </p>
    )}
  </>
);

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
          <Table head={['Cost', 'Input', 'Why it matters']} rows={playbook.cost_inputs.map(c => [c.category, c.input, c.why])} />
        </Panel>
      )}
    </section>
  );
};
