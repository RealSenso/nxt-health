import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { store } from '../../services/store';
import { PublicLayout } from './PublicLayout';
import { Btn, Eyebrow, H1 } from './ui';

/**
 * "How to start a startup in India": the free guide. Anyone can read it; signed-in people can tick off steps
 * and their progress is saved to their account.
 */
export const GuidePage: React.FC = () => {
  const guide = store.getGuide();
  const signedIn = store.isAuthenticated();
  const scopeKey = signedIn ? store.getScopeKey(store.getCurrentUser()) : '';
  const progress = guide && signedIn ? store.getUserProgress(scopeKey, guide.category.id) : {};
  const [open, setOpen] = useState<string>(guide?.steps[0]?.id || '');

  const done = guide ? guide.steps.filter(s => progress[s.id]).length : 0;
  const total = guide?.steps.length || 0;
  const playbook = guide?.category.playbook;

  return (
    <PublicLayout variant="home">
      <section className="nxt-container pt-14 sm:pt-20 pb-12 border-b border-[var(--nxt-line)]">
        <Eyebrow>Free guide</Eyebrow>
        <H1 className="mt-6 max-w-[20ch]">How to start a startup in India.</H1>
        <p className="mt-6 max-w-2xl text-[clamp(1.05rem,1.5vw,1.25rem)] leading-relaxed text-[var(--nxt-ink)]/80">
          Every step from a first idea to an incorporated, recognised, compliant and funded company, in the order you will need them.
          Free for everyone with an account.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {signedIn ? (
            total > 0 && <p className="text-[15px]"><span className="font-semibold">{done} of {total}</span> phases complete</p>
          ) : (
            <Btn to="/login">Log in to track your progress</Btn>
          )}
        </div>
      </section>

      <section className="nxt-container py-14 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-20 items-start">
        <div>
          {!guide || guide.steps.length === 0 ? (
            <p className="text-[var(--nxt-ink-soft)]">The guide is being set up. Please check back soon.</p>
          ) : (
            <ol className="space-y-4">
              {guide.steps.map((step, index) => {
                const isOpen = open === step.id;
                const finished = !!progress[step.id];
                return (
                  <li key={step.id} className="rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
                    <button onClick={() => setOpen(isOpen ? '' : step.id)} className="w-full flex items-center gap-4 text-left px-6 py-5" aria-expanded={isOpen}>
                      <span className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center text-sm font-bold ${finished ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-ink)]'}`}>
                        {finished ? <Check className="w-4 h-4" /> : String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display font-bold text-xl tracking-[-0.02em]">{step.name}</span>
                        <span className="block text-sm text-[var(--nxt-ink-soft)] mt-0.5">{step.description}{step.typical_duration ? ` · ${step.typical_duration}` : ''}</span>
                      </span>
                      <ChevronDown className={`w-5 h-5 shrink-0 text-[var(--nxt-ink-soft)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <ul className="divide-y divide-[var(--nxt-line)] border-t border-[var(--nxt-line)]">
                          {(step.tasks || []).map(task => (
                            <li key={task.id} className="py-4">
                              <p className="font-semibold text-[var(--nxt-ink)]">{task.label}</p>
                              <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">{task.detail}</p>
                              <dl className="mt-3 grid gap-x-8 gap-y-2 text-[14px] sm:grid-cols-2">
                                {task.experts && <div><dt className="text-[var(--nxt-ink-soft)]">Who can help</dt><dd>{task.experts}</dd></div>}
                                {task.resources && <div><dt className="text-[var(--nxt-ink-soft)]">Where to start</dt><dd>{task.resources}</dd></div>}
                                {task.deliverable && <div><dt className="text-[var(--nxt-ink-soft)]">You should end up with</dt><dd>{task.deliverable}</dd></div>}
                                {task.duration && <div><dt className="text-[var(--nxt-ink-soft)]">Roughly</dt><dd>{task.duration}</dd></div>}
                              </dl>
                            </li>
                          ))}
                        </ul>
                        {signedIn ? (
                          <button
                            onClick={() => store.toggleStepProgress(scopeKey, guide.category.id, step.id)}
                            className={`mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold border ${finished ? 'border-[var(--nxt-ink)]' : 'bg-[var(--nxt-ink-fixed)] text-white border-transparent'}`}
                          >
                            <Check className="w-4 h-4" /> {finished ? 'Completed — mark as not done' : 'Mark this phase complete'}
                          </button>
                        ) : (
                          <p className="mt-5 text-sm text-[var(--nxt-ink-soft)]">Log in to tick off phases and save your progress.</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24">
          {playbook && playbook.how_to_use.length > 0 && (
            <div className="rounded-[18px] border border-[var(--nxt-line)] p-6">
              <h2 className="font-display font-bold text-lg tracking-[-0.02em]">How to use this guide</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">
                {playbook.how_to_use.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}
          {playbook && playbook.cost_inputs.length > 0 && (
            <div className="rounded-[18px] border border-[var(--nxt-line)] p-6">
              <h2 className="font-display font-bold text-lg tracking-[-0.02em]">What to budget for</h2>
              <ul className="mt-4 space-y-4 text-[15px]">
                {playbook.cost_inputs.map(c => (
                  <li key={c.category}>
                    <p className="font-semibold text-[var(--nxt-ink)]">{c.category}</p>
                    <p className="text-[var(--nxt-ink-soft)] mt-0.5">{c.input}. {c.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </PublicLayout>
  );
};
