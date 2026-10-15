import React from 'react';
import { FUNDING_FORM, isAnswered, type Answers } from '../../data/fundingForm';

/** The full answers of a funding application, grouped by the form's sections. Shows only what was answered. */
export const ApplicationAnswers: React.FC<{ answers?: Answers }> = ({ answers }) => {
  if (!answers || Object.keys(answers).length === 0) return null;
  const sections = FUNDING_FORM
    .map(section => ({ section, rows: section.questions.filter(q => isAnswered(answers[q.id])) }))
    .filter(s => s.rows.length > 0);
  if (sections.length === 0) return null;

  return (
    <details className="rounded-xl border border-[var(--nxt-line)] bg-[var(--nxt-bg-soft)]">
      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-[var(--nxt-ink)]">Full application ({Object.keys(answers).length} answers)</summary>
      <div className="px-4 pb-4 space-y-6">
        {sections.map(({ section, rows }) => (
          <section key={section.id}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[var(--nxt-ink-soft)] border-b border-[var(--nxt-line)] pb-1">{section.title}</h4>
            <dl className="mt-3 space-y-3">
              {rows.map(q => {
                const value = answers[q.id];
                return (
                  <div key={q.id}>
                    <dt className="text-xs font-semibold text-[var(--nxt-ink-soft)]">{q.label}</dt>
                    <dd className="text-sm text-[var(--nxt-ink)] whitespace-pre-line mt-0.5">
                      {q.type === 'checkbox' ? 'Confirmed' : Array.isArray(value) ? value.join(', ') : value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </details>
  );
};
