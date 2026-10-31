import React, { useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { store } from '../../services/store';
import { PublicLayout } from './PublicLayout';
import { Btn, Eyebrow, H1 } from './ui';

/** The "How to?" topics, in order. The first one holds the Start in India roadmap. */
const TOPICS = [
  "Incorporate a Startup in India",
  "Register a Startup with DPIIT (Startup India)",
  "Choose the Right Legal Structure for Your Startup",
  "Decide How to Split Equity Among Co-Founders",
  "Protect Your Intellectual Property",
  "Decide Between Patents and Trade Secrets",
  "File a Patent for Your Innovation",
  "Set Up a HealthTech Company in India and the US",
  "Protect Health Data Under India's DPDP Act",
  "Understand HIPAA Requirements for the US Market",
  "Get Regulatory Approval for a Medical Device in India",
  "Understand FDA Approval for Medical Devices in the US",
  "Obtain Ethics Committee Approval for a Clinical Study",
  "Prepare a Clinical Data-Sharing Agreement",
  "Get Your Product Approved by a Hospital",
  "Build a Business Case for Hospitals",
  "Calculate the Return on Investment for Your Product",
  "Conduct Market Research for Your Startup",
  "Estimate the Market Size for Your Product",
  "Identify Your Customer and Buyer",
  "Develop a Go-to-Market Strategy",
  "Price Your Healthcare Product or Service",
  "Enter the Indian Healthcare Market",
  "Apply for BIRAC Grants",
  "Find Non-Dilutive Funding for Your Startup",
  "Prepare a Grant Application",
  "Plan Your Startup's Funding Strategy",
  "Prepare Your Startup for Fundraising",
  "Build an Investor Pitch Deck"
];

/**
 * "How to?": a list of topics, each opening with a + sign. The first one holds the free Start in India roadmap. Anyone can read it; signed-in people can tick off steps
 * and their progress is saved to their account.
 */
export const GuidePage: React.FC = () => {
  const guide = store.getGuide();
  const signedIn = store.isAuthenticated();
  const guideProject = store.getRoadmapProblems().find(p => p.guide);
  // Signed-in people use the guide inside Roadmaps, like every other roadmap.
  if (signedIn && guideProject) return <Navigate to={`/roadmaps/${guideProject.id}`} replace />;
  const scopeKey = signedIn ? store.getScopeKey(store.getCurrentUser()) : '';
  const progress = guide && signedIn ? store.getUserProgress(scopeKey, guide.category.id) : {};
  const [open, setOpen] = useState<string>(guide?.steps[0]?.id || '');
  const [topicOpen, setTopicOpen] = useState<number>(0);

  const done = guide ? guide.steps.filter(s => progress[s.id]).length : 0;
  const total = guide?.steps.length || 0;
  const playbook = guide?.category.playbook;

  const extras = (
    <ul className="pb-6 max-w-xl">
      {['Checklist', 'Podcast', 'Information'].map((label, i) => (
        <li key={label} className="flex items-center gap-4 py-3 border-t border-[var(--nxt-line)] text-[15px]">
          <span className="w-5 font-mono text-[var(--nxt-ink-soft)]">{String.fromCharCode(97 + i)}.</span>
          <span className="flex-1">{label}</span>
          <span className="text-[13px] text-[var(--nxt-ink-soft)]">Coming soon</span>
        </li>
      ))}
    </ul>
  );

  const roadmap = (
    <div className="pb-6 grid gap-10 lg:grid-cols-[1fr_20rem] items-start">
      <div>
        <p className="text-[15px] text-[var(--nxt-ink-soft)] mb-5 max-w-xl">
          Every step from a first idea to an incorporated, recognised, compliant and funded company, in the order you will need them.
          {signedIn && total > 0 ? ` ${done} of ${total} phases complete.` : ''}
        </p>
        {!guide || guide.steps.length === 0 ? (
          <p className="text-[var(--nxt-ink-soft)]">The roadmap is being set up. Please check back soon.</p>
        ) : (
            <ol className="space-y-3">
              {guide.steps.map((step, index) => {
                const isOpen = open === step.id;
                const finished = !!progress[step.id];
                return (
                  <li key={step.id} className="rounded-[18px] border border-[var(--nxt-line)] bg-[var(--nxt-surface)]">
                    <button onClick={() => setOpen(isOpen ? '' : step.id)} className="w-full flex items-center gap-4 text-left px-6 py-5" aria-expanded={isOpen}>
                      <span className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center text-sm ${finished ? 'bg-[var(--nxt-ink-fixed)] text-white border-transparent' : 'border-[var(--nxt-ink)]'}`}>
                        {finished ? <Check className="w-4 h-4" /> : String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-xl tracking-[-0.02em]">{step.name}</span>
                        <span className="block text-sm text-[var(--nxt-ink-soft)] mt-0.5">{step.description}{step.typical_duration ? ` · ${step.typical_duration}` : ''}</span>
                      </span>
                      <ChevronDown className={`w-5 h-5 shrink-0 text-[var(--nxt-ink-soft)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <ul className="divide-y divide-[var(--nxt-line)] border-t border-[var(--nxt-line)]">
                          {(step.tasks || []).map(task => (
                            <li key={task.id} className="py-4">
                              <p className="text-[var(--nxt-ink)]">{task.label}</p>
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
                            className={`mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm border ${finished ? 'border-[var(--nxt-ink)]' : 'bg-[var(--nxt-ink-fixed)] text-white border-transparent'}`}
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
        {!signedIn && <div className="mt-6"><Btn to="/login">Log in to track your progress</Btn></div>}
      </div>
        <aside className="space-y-6">
          {playbook && playbook.how_to_use.length > 0 && (
            <div className="rounded-[18px] border border-[var(--nxt-line)] p-6">
              <h2 className="font-display text-lg tracking-[-0.02em]">How to use this guide</h2>
              <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[var(--nxt-ink-soft)]">
                {playbook.how_to_use.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}
          {playbook && playbook.cost_inputs.length > 0 && (
            <div className="rounded-[18px] border border-[var(--nxt-line)] p-6">
              <h2 className="font-display text-lg tracking-[-0.02em]">What to budget for</h2>
              <ul className="mt-4 space-y-4 text-[15px]">
                {playbook.cost_inputs.map(c => (
                  <li key={c.category}>
                    <p className="text-[var(--nxt-ink)]">{c.category}</p>
                    <p className="text-[var(--nxt-ink-soft)] mt-0.5">{c.input}. {c.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
    </div>
  );

  return (
    <PublicLayout variant="home">
      <section className="nxt-container pt-14 sm:pt-20 pb-2">
        <Eyebrow>Free guides</Eyebrow>
        <H1 className="mt-6">How to?</H1>
      </section>

      <section className="nxt-container py-10">
        <ol className="border-t border-[var(--nxt-line)]">
          {TOPICS.map((title, i) => {
            const isOpen = topicOpen === i;
            return (
              <li key={title} className="border-b border-[var(--nxt-line)]">
                <button
                  onClick={() => setTopicOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-5 text-left py-5"
                >
                  <span className="w-8 shrink-0 font-mono text-sm text-[var(--nxt-ink-soft)]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 font-display text-[clamp(1.05rem,1.6vw,1.3rem)] tracking-[-0.01em]">{title}</span>
                  <Plus className={`w-5 h-5 shrink-0 text-[var(--nxt-green)] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                </button>
                {isOpen && (
                  i === 0
                    ? <div className="pl-[3.25rem]">{extras}{roadmap}</div>
                    : <p className="pl-[3.25rem] pb-6 text-[15px] text-[var(--nxt-ink-soft)]">Coming soon.</p>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </PublicLayout>
  );
};
